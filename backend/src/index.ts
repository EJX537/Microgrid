import express, { Express, Request, Response, response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser = require('body-parser');

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const port = process.env.PORT || 8080;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

// let clients: any[] = [];
// let mytime: Date = new Date();

// function eventsHandler(request: Request, response: Response){
//   const headers = {
//     'Content-Type': 'text/event-stream',
//     'Connection': 'keep-alive',
//     'Cache-Control': 'no-cache'
//   };
//   response.writeHead(200, headers);

//   const data = `data: ${JSON.stringify(mytime.getTime())}\n\n`;

//   response.write(data);

//   const clientId = Date.now();

//   const newClient = {
//     id: clientId,
//     response
//   };

//   clients.push(newClient);

//   request.on('close', () => {
//     console.log(`${clientId} Connection closed`);
//     clients = clients.filter(client => client.id !== clientId);
//   });
// }

app.get("/time", (request, response)=>{
  response.setHeader("Content-Type", "text/event-stream");
  periodic(response);
});

function periodic(res: Response){
  res.write("data: " + `hello!${new Date()}\n\n`)
  setTimeout(()=>periodic(res), 1000);
}

app.listen(port, () => {
  console.log(`⚡️[server]: Microgrid Server is running at http://localhost:${port}`);
});
