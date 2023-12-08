# Frontend Documentation

## Table of Contents
1. Introduction
2. How to run
3. Structure Layout
4. Known bugs

## Introduction
The Frontend is built on React.js and TypeScript. Styling is done mainly with Tailwind. The reason Ant Design is in the project is because the initial plan was to use Ant Charts but its no longer used. Ant Design is still used in some parts but very minimally.

## How to run
### Docker
#### To run use the following command:
```bash
docker-compose up
```
If there is an error you can try to delete the image for frontend and rebuild it

### For Dev
#### It is recommended by not require for you to develop in docker
#### Use the following command for development:

```bash
npm run dev
```

## Structure Layout
The files are split into sub directories. 
### Components 
Its mainly for components that show on every page or things that can be reused.
### Context
Global Context
### Interface
Global Type Definition
### Layouts
The structure of the pages
### Pages
Unique URLs
### Routes
Route management
## Known bugs
eGauge Chart will crash if the backend does not send data. It filters data by a time limit and if the backend doesn't send up to date data, it will result in an empty array and crash if you try to hover over it.

It is possible to send a request for an entry in the eGauge table that does not exist and not get any data back.

Weather is known to bug out and sometimes not load in.

When editing the time limit for eGauge chart it should send another query but it doesn't right now.
## Incomplete
The dual axis chart is not optimized and connected.

Editing configs are stored in state but not in backend/database.

Panel specifics are stored in state but not in backend/database.

No coming from logs from the backend.

Default configs are in the frontend and not initialized by the backend.

HVAC and water tank is not connected.
