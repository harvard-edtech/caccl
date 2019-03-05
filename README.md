# CACCL
The **C**anvas **A**pp **C**omplete **C**onnection **L**ibrary (CACCL): an all-in-one library for connecting your script or app to Canvas. By handling LTI, authorization, and api for you, CACCL makes building Canvas tools quick and easy.

# Quickstart

## Initialize your Project

Starting a new project with caccl is easy. In an empty directory or npm project directory, run:

`npm init caccl`

You'll be prompted to choose one of the following project types:

Project Type | Client | Description
:--- | :--- | :---
React + Express App | React | React front-end with a simple Express back-end
Node.js Script | Terminal |  A simple Node.js script that runs in terminal
EJS + Express Server-side App | EJS Templates | A server-side app with an Express server and UI templating with EJS

Once you've chosen from the list, follow instructions and jump to the corresponding docs:

- [React + Express App Docs](#if-you-chose-react--express-app)
- [Node.js Script](#if-you-chose-nodejs-script)
- [EJS + Express Server-side App](#if-you-chose-ejs--express-server-side-app)

If your type of project isn't covered above, see [Manual Set Up](#manual-set-up) below.

## If you chose _React + Express App_...

#### Developer Mode

To **start your app in developer mode**, open three terminal windows in the project root directory. Run each of the following commands, one in each window:

- `npm run dev:canvas` – starts a Canvas launch simulator
- `npm run dev:server` – starts the app server
- `npm run dev:client` – starts React's live dev environment

**Launch:** to simulate an LTI launch for your app, see instructions in the first window (Canvas simulator).

#### Production Mode

To **start your app in production mode**, run the following commands in order:

- `npm run build` – create the production build of the app
- `npm start` – to start the production app

#### Back-end

To **edit the back-end**, edit `server.js`. The server is an express app. Visit the [expressjs.com app docs](https://expressjs.com/en/4x/api.html#app) for instructions on how to add routes, etc. 

_Canvas API:_

> If the user is authorized, then `req.api` will be defined.
>
> Use `req.api` to access Canvas from within a server route. `req.api` is an instance of caccl-api. See the full list of functions at the [caccl-api-docs](https://harvard-edtech.github.io/caccl-api/).
>
> Example:
>
> ```js
> app.get('/name', async (req, res) => {
>   const profile = await req.api.user.self.getProfile();
>   return res.send(profile.name);
> });
> ```

_LTI Launch Info:_

> If the user successfully launched via LTI, `req.session.launchInfo` will be defined and contain properties. This object contains lots of information about the user, the context, and anything else we were able to parse from the LTI launch.
>
> See [launchInfo docs](https://github.com/harvard-edtech/caccl-lti/blob/master/docs/LaunchInfo.md) for full list of properties.

#### Front-end

To **edit the front-end**, edit your React project in the `/client` folder. Start by editing `/client/src/App.js`. To integrate any component with the server or with Canvas, use the following:

_Adding CACCL to a React Component:_

> ```js
> // Import CACCL
> import initCACCL from 'caccl/client/cached';
>
> // Initialize CACCL
> const {
>   api,
>   getStatus,
>   sendRequest,
> } = initCACCL();
> ```
>
> See each section below on how to use `api`, `getStatus`, and `sendRequest`.

_Canvas API:_

> An instance of caccl-api is passed back from `initCACCL()`. See the full list of functions at the [caccl-api-docs](https://harvard-edtech.github.io/caccl-api/).
>
> Example:
>
> ```js
> const { api } = initCACCL();
> 
> const students = await api.course.listStudents({ courseId: 532894 });
> ```
> 
> We recommend handling errors with try-catch:
> 
> ```js
> try {
>   const students = await api.course.listStudents({ courseId: 532894 });
>   ...
> } catch (err) {
>   // Update app to show error:
>   this.setState({
>     status: 'error',
>     message: err.message,
>     code: err.code,
>   });
> }
> ```

_Status and LTI Launch Info:_

> Calling `getStatus` fetches many useful status variables from the server, as well as gets LTI launch information.
>
> ```js
> const { getStatus } = initCACCL();
>
> const status = await getStatus();
> ```
>
> Properties of `status`:
>
> Property | Type | Description
> :--- | :--- | :---
> launched | boolean | if true, the user successfully launched the app via LTI
> authorized | boolean | if true, we have authorization to access the Canvas API
> launchInfo | object | included if `launched` is true, see [launchInfo docs](https://github.com/harvard-edtech/caccl-lti/blob/master/docs/LaunchInfo.md) for full list of properties
>
> **Note:** see [launchInfo docs](https://github.com/harvard-edtech/caccl-lti/blob/master/docs/LaunchInfo.md) for more on the `launchInfo` property.

_Sending requests to the server:_

> Use `sendRequest` to send requests to the server. See [caccl-send-request docs](https://www.npmjs.com/package/caccl-send-request) for more information.
>
> Example:
>
> ```js
> const { sendRequest } = initCACCL();
> 
> const { body, status, headers } = await sendRequest({
>   path: '/add-user',
>   method: 'POST',
>   params: {
>     name: 'Divardo Calicci',
>     age: 19,
>   },
> });
> ```

> _Why use `sendRequest` instead of other request senders? Our `sendRequest` function works cross-domain with our development environment (dev server runs on one port, dev client runs on another)_

## If you chose _Node.js Script_...

#### Run your script:

To **run** your script, use `npm start` in the project root directory

#### Edit your script:

To **edit** your script, edit `script.js`. The script's only argument, `api`, is an instance of caccl-api...see the full list of functions at the [caccl-api-docs](https://harvard-edtech.github.io/caccl-api/).

_Canvas API:_

> Use `api`, the only argument of the function in `script.js`.
> 
> Example:
> 
> ```js
> module.exports = async (api) => {
>   // Get profile via Canvas API
>   const profile = await api.user.self.getProfile();
> 
>   // Say "hello"
>   console.log(`Hi ${profile.name}, it's great to meet you!`);
> };
> ```
> 
> See the full list of supported API functions at the [caccl-api-docs](https://harvard-edtech.github.io/caccl-api/).
> 
> We recommend handling errors using try-catch:
> 
> ```js
> try {
>   const profile = await api.user.self.getProfile();
>   ...
> } catch (err) {
>   console.log(`An error occurred (code: ${err.code}): ${err.message}`);
>   process.exit(1);
> }

#### Configuring CACCL:

Before your script in `script.js` runs, we initialize CACCL in `index.js`. To customize CACCL's behavior or turn on/off certain functionality, edit the configuration options passed into `initCACCL(...)`:

**Note:** configuration options are _optional_ unless otherwise stated

Config Option | Type | Description | Default
:--- | :--- | :--- | :---
defaultNumRetries | number | the number of times to retry failed requests | 3
itemsPerPage | number | the number of items to request on a get request | 100
cacheType | string | if 'memory', cache is stored in memory. If 'session', cache is stored in the express session. To include a custom cache, include it using the "cache" config option | none
cache | [Cache](https://github.com/harvard-edtech/caccl-api/blob/master/contributor-docs/Cache.md) | a custom cache instance (Not required if using 'memory' or 'session' cacheType: those caches are built-in) | none


## If you chose _EJS + Express Server-side App_...

#### Developer Mode

To **start your app in developer mode**, open two terminal windows in the project root directory. Run each of the following commands, one in each window:

- `npm run dev:canvas` – starts a Canvas launch simulator
- `npm run dev:server` – starts the app server

**Launch:** to simulate an LTI launch for your app, see instructions in the first window (Canvas simulator).

#### Production Mode

To **start your app in production mode**, run `npm start` from the root directory of your project.

#### Editing your app

To add routes to your Express server, edit `routes.js`.

_Checking if we have authorization to use API:_

> Within a route, to check if we have authorization to use the API, simply check if `req.api` is defined:
> 
> ```js
> app.get('/student-names', async (req, res) => {
>   if (!req.api) {
>     return res.send('Oops! You are not authorized.');
>   }
>   ...
> });
> ```

_Canvas API:_

> `req.api` is an instance of caccl-api. See the full list of functions at the [caccl-api-docs](https://harvard-edtech.github.io/caccl-api/).
>
> Example:
>
> ```js
> app.get('/student-names', async (req, res) => {
>   if (!req.api) {
>     return res.send('Oops! You are not authorized.');
>   }
>   
>   const students = await req.api.course.listStudents({ courseId: 58320 });
> 
>   const names = students.map(x => x.name).join(', ');
> 
>   return res.send(`Here are all your student's names: ${names}`);
> });
> ```
> 
> We recommend handling errors with a try-catch statement:
> 
> ```js
> app.get('/student-names', async (req, res) => {
>   ...
>   try {
>     const students = await req.api.course.listStudents({ courseId: 58320 });
>   } catch (err) {
>     return res.status(500).send(err.message);
>   }
>   ...
> });
> ```

_Adding views:_

> Add EJS templates to the `/views` folder. See [EJS docs](https://ejs.co) for full documentation. Here's a brief overview:
> 
> **Writing an EJS template:** In an `.ejs` template file, use `<%= ... %>` to add placeholder text, use `<%- ... %>` to add placeholder html, and use `<% ... %>` to run javascript. See examples:
> 
> ```html
> <div>
>   <!-- Show app title (plain text) -->
>   <h1>
>     <%= title %>
>   </h1>
> 
>   <!-- Show app description (html) -->
>   <p>
>     Description:&nbsp;
>     <%- description %>
>   </p>
>
>   <!-- Display number of students with correct pluralization: -->
>   <h2>
>     <% const plural = (numStudents > 1); %>
>     You have <%= numStudents %> student<%= plural ? '' : 's' %>.
>   </h2>
> </div>
> ```
> 
> **Rendering an EJS template:** Within an express route, use `res.render` to render an EJS template. In this example, we have a `/views/home.ejs` file
> 
> ```js
> const path = require('path');
> ...
> app.get('/student-names', async (req, res) => {
>   return res.render(path.join(__dirname, 'views', 'home'), {
>     title: 'My App',
>     description: 'A <strong>fantastic</strong> app!',
>     numStudents: 24,
>   });
> });
> ```

## Manual Set Up:

### Script

Visit our [using CACCL with a Node.js Script](https://github.com/harvard-edtech/caccl/blob/master/docs/script.md) guide.

### React + Express App:

Visit our [using CACCL with React](https://github.com/harvard-edtech/caccl/blob/master/docs/react.md) guide for step-by-step instructions.

### Other Express-based App:

See the following guides:

- [Using CACCL on an Express Server](https://github.com/harvard-edtech/caccl/blob/master/docs/server.md)
- [Using CACCL on a Client](https://github.com/harvard-edtech/caccl/blob/master/docs/client.md)
