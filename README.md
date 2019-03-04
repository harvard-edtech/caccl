# CACCL
The **C**anvas **A**pp **C**omplete **C**onnection **L**ibrary (CACCL): an all-in-one library for connecting your script or app to Canvas. By handling LTI, authorization, and api for you, CACCL makes building Canvas tools quick and easy.

## Quickstart

Starting a new project with caccl is easy. In an empty directory or npm project directory, run:

`npm init caccl`

You'll be prompted to choose one of the following project types. Choose one and follow instructions.

Project Type | Client | Description
:--- | :--- | :---
React + Express App | React | React front-end with a simple Express back-end
Node.js Script | Terminal |  A simple Node.js script that runs in terminal
EJS + Express Server-side app | EJS Templates | A server-side app with an Express server and UI templating with EJS

If your type of project isn't covered above, see _Manual Set Up_ below.

### If you chose _React + Express App_...

The initialization wizard will walk you through setting up your dev environment. If you skipped this, please _re-run_ `npm init caccl` 


- To **launch** your app, open three terminal windows in the project root directory. Run each of the following commands, one in each window:
  - `npm run dev:canvas` – starts a Canvas launch simulator
  - `npm run dev:server` – starts the app server
  - `npm run dev:client` – starts React's live dev environment

- To **edit the back-end**, 



### If you chose _Node.js Script_...


- To **run** your script, use `npm start` in the project root directory


- To **edit** your script, edit `script.js`. The script's only argument, `api`, is an instance of caccl-api...see the full list of functions at the [caccl-api-docs](https://harvard-edtech.github.io/caccl-api/).

### If you chose _EJS + Express Server-side App_...






## Manual Set Up:

### Script

Visit our [using CACCL with a Node.js Script](https://github.com/harvard-edtech/caccl/blob/master/docs/script.md) guide.

### React + Express App:

Visit our [using CACCL with React](https://github.com/harvard-edtech/caccl/blob/master/docs/react.md) guide for step-by-step instructions.

### Other Express-based App:

See the following guides:

- [Using CACCL on an Express Server](https://github.com/harvard-edtech/caccl/blob/master/docs/server.md)
- [Using CACCL on a Client](https://github.com/harvard-edtech/caccl/blob/master/docs/client.md)
