import express, { Express, Request, Response, response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser = require('body-parser');
import db from './db';


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

interface eGaugeData {
  source: string;
  dateTime: Date;
  value: number;
  unit: string;
}

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

interface RateData {
  S4_L2: string;
  S3_L1: string;
  S6_L2: string;
  S5_L1: string;
  S2_L1: string;
  S1_L1: number;
  time: string;
}

app.get("/kitchen", async (request, response)=>{
  response.setHeader("Content-Type", "text/event-stream");
  await periodickitchen(response);
});

//egauage serversent event, get, put
async function periodickitchen(res: Response){
  const [rows] = await db.execute('SELECT * FROM rate ORDER BY time DESC LIMIT 1;');
  const val = parseRows<RateData[]>(rows)[0];
  const data: eGaugeData = {
    source: "Kitchen",
    dateTime: new Date(val.time),
    value: val.S1_L1,
    unit: "W",
  }
  // console.log(data)
  res.write("data:" + `${JSON.stringify(data)}\n\n`);
  setTimeout(()=>periodickitchen(res), 1000);
}

//powerview get last 30s/1min/30min/1hr kitchen
app.get("/kitchentime", function getkitchen(req: Request, res: Response){
  try{
    let seconds = parseInt(req.query?.sec as string, 10);
    const data: eGaugeData = {
      source: "Kitchen",
      dateTime: new Date(),
      value: 10,
      unit: "W",
    }
    res.send('kitchen time GET: ' + req.query.sec);
  }catch(err){
    console.log(err);
  }
});

//powerview battery charge get
app.get("/battery", async function getkitchen(req: Request, res: Response){
  try{
    const data: batteryConfig = {
      source: "Battery",
      warning: 0.4,
      danger: 0.2,
    }
    res.send('battery GET: ' + req.query.sec);
    const [rows, fields] = await db.execute('SELECT * FROM rate');
    // res.send(JSON.stringify(rows));
    console.log(rows);
  }catch(err){
    console.log(err);
  }
});


function parseRows<T>(rows: any): T {
  return rows as T;
}
//poweor outage solar get
app.get("/solar", async (req: Request, res: Response) => {
  try{
    const data: batteryConfig = {
      source: "Solar",
      warning: 0.4,
      danger: 0.2,
    }
    const [rows] = await db.execute('SELECT * FROM rate ORDER BY time DESC LIMIT 1;');
    const val = parseRows<RateData[]>(rows);
    console.log(val[0].time)
    res.send(`solar GET: ${JSON.stringify(data)}\n\n`);
    // res.send('solar GET');
  }catch(err){
    console.log(err);
  }
});

//powerview weather get
app.get("/weather", function getkitchen(req: Request, res: Response){
  try{
    const data: WeatherData = {
      detailedForecast: "details",
      startTime: "start date",
      endTime: "end date",
      isDaytime: true,
      name: "my weather",
      dewpoint: {
        unitCode: "K",
        value: 3,
      },
      probabilityOfPrecipitation: {
        unitCode: "K",
        value: 3 || null,
      },
      relativeHumidity: {
        unitCode: "K",
        value: 3,
      },
      shortForecast: "hi",
      temperature: 72,
      temperatureUnit: "F",
      windDirection: "south",
      windSpeed: "32",
    }
    res.send(`weather GET: ${JSON.stringify(data)}\n\n`);
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
