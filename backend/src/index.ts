import express, { Express, Request, Response, response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser = require('body-parser');
import db from './db';

import { RowDataPacket } from 'mysql2/promise';

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const port = process.env.PORT || 8080;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Servers');
});

interface WeatherData {
	detailedForecast: string;
	dewpoint: {
		unitCode: string;
		value: number;
	};
	endTime: string;
	isDaytime: boolean;
	name: string;
	probabilityOfPrecipitation: {
		unitCode: string;
		value: number | null;
	};
	relativeHumidity: {
		unitCode: string;
		value: number;
	};
	shortForecast: string;
	startTime: string;
	temperature: number;
	temperatureUnit: string;
	windDirection: string;
	windSpeed: string;
}

// interface kitchenData {
//   source: string;
//   dateTime: Date;
//   S11_L1: number;
//   S12_L2: number;
//   unit: string;
// }

interface batteryConfig{
  source: string;
  warning: number,
	danger: number,
}

interface powerViewData{
  dateTime: Date;
	source: string;
	watt: number;
}

interface dashboardConfig {
  refreshRate: number;
}

let dashboard: dashboardConfig = {
  refreshRate: 10,
}

interface rateData {
  S4_L2?: string;
  S3_L1?: string;
  S6_L2?: string;
  S5_L1?: string;
  S2_L1?: string;
  S1_L1?: number;
  S8_L2?: number;
  S7_L1?: number;
  S10_L2?: number;
  S9_L1?: number;
  S12_L2?: number;
  S11_L1?: number;
  time?: string;
}

interface eGaugeData {
  source?: string;
  S4_L2?: string;
  S3_L1?: string;
  S6_L2?: string;
  S5_L1?: string;
  S2_L1?: string;
  S1_L1?: number;
  S8_L2?: number;
  S7_L1?: number;
  S10_L2?: number;
  S9_L1?: number;
  S12_L2?: number;
  S11_L1?: number;
  dateTime?: string;
}

app.get("/egauge", async (request, response)=>{
  response.setHeader("Content-Type", "text/event-stream");
  await periodickitchen(response);
});

//egauage serversent event, get, put
async function periodickitchen(res: Response) {
	try {
		const [rows] = await db.execute('SELECT * FROM rate ORDER BY time DESC LIMIT 1;');
		const val = parseRows<rateData[]>(rows)[0];
		const data: eGaugeData = {
			source: "egauge",
			S4_L2: val.S4_L2,
			S3_L1: val.S3_L1,
			S6_L2: val.S6_L2,
			S5_L1: val.S5_L1,
			S2_L1: val.S2_L1,
			S1_L1: val.S1_L1,
			S8_L2: val.S8_L2,
			S7_L1: val.S7_L1,
			S10_L2: val.S10_L2,
			S9_L1: val.S9_L1,
			S12_L2: val.S12_L2,
			S11_L1: val.S11_L1,
			dateTime: val.time
		}
		// console.log(data)
		res.write("data:" + `${JSON.stringify(data)}\n\n`);
		setTimeout(() => periodickitchen(res), 1000);
	} catch (error) {
		console.error("An error occurred:", error);
		// Handle the error gracefully, e.g., send an error response to the client
		res.status(500).send("An error occurred");
	}
}

//powerview get last 30s/1m/30m/1h kitchen
app.get("/eguagetime", async (req: Request, res: Response) => {
  try{
    const time = req.query?.time as string;
    const dataname = req.query?.dataname as string;
    let query = ``;
    if (time.charAt(time.length-1) == "s"){
      query = `
      SELECT ${dataname}, time
      FROM rate
      where time>= NOW() - INTERVAL 28800 + ? SECOND;
    `;
    }else if (time.charAt(time.length-1) == "m"){
    query = `
      SELECT ${dataname}, time
      FROM rate
      where time>= NOW() - INTERVAL 480 + ? MINUTE;
    `;
    }else{
      query = `
      SELECT ${dataname}, time
      FROM rate
      where time>= NOW() - INTERVAL 8 + ? HOUR;
    `;
    }
    const [rows] = parseRows<rateData[]>(await db.execute(query, [time.slice(0,-1)]));
    // console.log(rows)
    res.send(rows);
  }catch(err){
    console.log(err);
  }
});

//powerview get start and end timestamp
app.get("/eguageperiod", async (req: Request, res: Response) => {
  try{
    const start = req.query?.start as string;
    const end = req.query?.end as string;
    const dataname = req.query?.dataname as string;
    let query = `
      SELECT ${dataname}
      FROM rate
      where time BETWEEN "${start}" AND "${end}";
    `;
    const [rows] = parseRows<rateData[]>(await db.execute(query));
    // console.log(rows)
    res.send(rows);
  }catch(err){
    console.log(err);
  }
});

//weather get
app.get("/weather", async (req: Request, res: Response) => {
  try{
    let query = `
      SELECT *
      FROM weather_data 
      ORDER BY startTime DESC LIMIT 1;
    `;
    const [rows] = parseRows<rateData[]>(await db.execute(query));
    res.send(rows);
  }catch(err){
    console.log(err);
  }
});

//powerview battery charge get
app.get("/powerview", async (req: Request, res: Response) => {
  try{
    let query = `
      SELECT pac, etoday, etotal, income, updateAt
      FROM powerview_data 
      ORDER BY updateAt  DESC LIMIT 1;
    `;
    const [rows] = parseRows<rateData[]>(await db.execute(query));
    res.send(rows);
    // console.log(rows);
  }catch(err){
    console.log(err);
  }
});

function parseRows<T>(rows: any): T {
  return rows as T;
}

//poweor outage solar get
app.get("/solarConfig", async (req: Request, res: Response) => {
  try{
    const data: batteryConfig = {
      source: "Solar",
      warning: 0.4,
      danger: 0.2,
    }
    const [rows] = await db.execute('SELECT * FROM rate ORDER BY time DESC LIMIT 1;');
    const val = parseRows<rateData[]>(rows);
    console.log(val[0].time)
    res.send(`data: ${JSON.stringify(data)}\n\n`);
    // res.send('solar GET');
  }catch(err){
    console.log(err);
  }
});

//powerview energy generation server sent event and get request
app.get("/energy", (request, response)=>{
  response.setHeader("Content-Type", "text/event-stream");
  periodicEnergy(response);
});
function periodicEnergy(res: Response){
  const data: powerViewData = {
    dateTime: new Date(),
    source: "Energy",
    watt: 5000
  }
  res.write("data: " + `${JSON.stringify(data)}\n\n`)
  setTimeout(()=>periodicEnergy(res), 1000);
}

//config get and put
app.get("/solar", function getkitchen(res: Response){
  try{
    res.send('dashboard config GET: ' + JSON.stringify(dashboard));
  }catch(err){
    console.log(err);
  }
});

app.put("/solar", function getkitchen(req: Request, res: Response){
  try{
    dashboard = {
      refreshRate: parseInt(req.params.refreshRate),
    }
    res.send('dashboard config PUT success');
  }catch(err){
    console.log(err);
  }
});

//raw logs get put

app.listen(port, () => {
  console.log(`⚡️[server]: Microgrid Server is running at http://localhost:${port}`);
});
