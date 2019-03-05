# CACCL
The **C**anvas **A**pp **C**omplete **C**onnection **L**ibrary (CACCL): an all-in-one library for connecting your script or app to Canvas. By handling LTI, authorization, and api for you, CACCL makes building Canvas tools quick and easy.

# Quickstart

## Initialize your Project

#### 1. Create a new project:

In an empty directory or npm project directory, run:

`npm init caccl`

You'll be prompted to choose one of the following project types:

Project Type | Client | Description
:--- | :--- | :---
React + Express App | React | React front-end with a simple Express back-end
Node.js Script | Terminal |  A simple Node.js script that runs in terminal
EJS + Express Server-side App | EJS Templates | A server-side app with an Express server and UI templating with EJS

Choose a type and follow instructions.

_Custom project type:_ if your type of project isn't covered above, see [Manual Set Up](#manual-set-up) below.

#### 2. Read the docs for your project type:

Once you've chosen from the list, follow instructions and jump to the corresponding docs:

- [React + Express App Docs](#if-you-chose-react--express-app)
- [Node.js Script](#if-you-chose-nodejs-script)
- [EJS + Express Server-side App](#if-you-chose-ejs--express-server-side-app)



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

Remember to make sure to properly define the installationCredentials in `/config/installationCredentials.js` and the developerCredentials in `/config/developerCredentials.js` on the production machine.

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

#### Configuring CACCL on the Server

To change the default canvasHost, edit the value in `/config/canvasDefaults.js`.

To customize other aspects of how CACCl functions on the server, edit the configuration options being passed into `initCACCL(...)` in `index.js`:

_Configuration for Express server:_

> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> sessionSecret | string | the session secret to use when encrypting sessions | random string
> cookieName | string | the cookie name to sent to client's browser | "CACCL-based-app-session-[timestamp]-[random str]"
> sessionMins | number | the number of minutes the session should last for | 360 (6 hours)
> onListenSuccess | function | function to call when server starts listening | `console.log`
> onListenFail | function | function to call if server can't start listening | `console.log`
> sslKey | string | ssl key or filename where key is stored | self-signed certificate key
> sslCertificate | string | ssl certificate or filename where certificate is stored | self-signed certificate
> sslCA | string[] or string | certificate chain linking a certificate authority to our ssl certificate. If type is string, certificates will automatically be split | none
> clientOrigin | string | the origin host of the client (to allow CORS), if different from server host | none
> 
> If for any reason you want to **create the express server yourself**, just pass it in (see below). Note: If you pass in your own express server, all customization options above will be ignored. When creating your express server, make sure you initialize body parsing and express-session.
> 
> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> app | express server app | the express app to add routes to | optional | new express app

_Configuration for server API access:_

> If your app server doesn't need to access the Canvas API, set `disableServerSideAPI: true`.
> 
> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> disableServerSideAPI | boolean | if false, adds `req.api` to routes encapsulated by routesWithAPI | `false`
> routesWithAPI | string[] | list of routes to add api support to, `*` wildcard supported | all routes
> cacheType | string | if 'memory', cache is stored in memory. If 'session', cache is stored in the express session. To include a custom cache, include it using the "cache" config option | none
> cache | [Cache](https://github.com/harvard-edtech/caccl-api/blob/master/contributor-docs/Cache.md) | a custom cache instance (Not required if using 'memory' or 'session' cacheType (those caches are built-in) | none
> dontUseLaunchCanvasHost | boolean | if false, when a user launches the app via LTI, we use the LTI launch host as the canvasHost | `false`
> sendRequest | [SendRequest](https://github.com/harvard-edtech/caccl-send-request) | a function that sends an http request. We recommend leaving this as is | [caccl-send-request](https://github.com/harvard-edtech/caccl-send-request)
> 
> The following config options apply only to API requests made from the server via `req.api`:
> 
> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> accessToken | string | a default access token to apply to all requests, overridden by user's access token | none
> defaultNumRetries | number | the number of times to retry failed requests | 3
> itemsPerPage | number | the number of items to request on a get request | 100

_Configuration for client-side API forwarding:_

> Your React client sends Canvas API requests to the Express server, which forwards them to Canvas. If your React client doesn't need to access the Canvas API, set `disableClientSideAPI: true`.
> 
> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> disableClientSideAPI | boolean | if false, server forwards Canvas API requests | `false`
> apiForwardPathPrefix | string | API forwarding path prefix to add to all forwarded api requests. This is the prefix we use to listen for forwarded requests (ex: GET /api/v1/courses is forwarded through the server's /canvas/api/v1/courses route if this is set to "/canvas") | "/canvas"
> 
> Note: if you change `apiForwardPathPrefix` on the server, you need to change it on the client as well! We recommend not changing this.

_Configuration for Canvas authorization:_

> To access the Canvas API, we need an access token. CACCL gets the user's access token through Canvas' OAuth 2 authorization process. All you need to do is redirect the user to the launchPath and CACCL will perform the authorization process. If `disableAuthorizeOnLaunch` is false (see config for LTI launch), we authorize the user on launch.
>
> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> disableAuthorization | boolean | if false, sets up automatic authorization when the user visits the launchPath | `false`
> developerCredentials | object | Canvas app developer credentials in the form `{ client_id, client_secret }. _Required_ unless disableAuthorization is true | none
> defaultAuthorizedRedirect | string | the default route to redirect the user to after authorization is complete (you can override this for a specific authorization call by including `next=/path` as a query or body parameter when sending user to the launchPath) | "/"
> tokenStore | [TokenStore](https://github.com/harvard-edtech/caccl-authorizer/blob/master/docs/TokenStore.md) | null to turn off storage of refresh tokens or custom token store of form `{ get(key), set(key, val) }` where both get and set functions return promises | memory token store
> simulateLaunchOnAuthorize | boolean | if true, simulates an LTI launch upon successful authorization (if user hasn't already launched via LTI), essentially allowing users to launc the tool by visiting the launchPath (GET). _Note:_ `simulateLaunchOnAuthorize` is not valid unless `disableAuthorization`, `disableLTI`, and `disableServerSideAPI` are all false. | `false`

_Configuration for LTI launches:_

> CACCL automatically accepts LTI launch requests and parses the launch request body. If your app is not launched via LTI, you can turn off this feature using `disableLTI: true`.
> 
> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> disableLTI | boolean | if false, CACCL listens for and parses LTI launches | false
> installationCredentials | object | installation consumer credentials to use to verify LTI launch requests in the form `{ consumer_key, consumer_secret }`. _Required:_ `installationCredentials` is _required_ unless `disableLTI` is true.
> redirectToAfterLaunch | string | the path to redirect to after a successful launch | "/"
> nonceStore | object | a nonce store instance to use for keeping track of nonces of the form `{ check }` where `check` is a function: (nonce, timestamp) => Promise that resolves if valid, rejects if invalid
> disableAuthorizeOnLaunch | boolean | if false, user is automatically authorized upon launch. _Note:_ `disableAuthorizeOnLaunch` is not valid unless `disableAuthorization` and `disableServerSideAPI` are false. | `false`

#### Configuring CACCL on the Client:

When initializing CACCl within a React component, you can pass in configuration options to customize CACCL's behavior. Example:

```js
// Import CACCL
import initCACCL from 'caccl/client/cached';

// Initialize CACCL
const {
  api,
  getStatus,
  sendRequest,
} = initCACCL({
  defaultNumRetries: 5,
  itemsPerPage: 200,
});
```

All configuration options are optional:

Config Option | Type | Description | Default
:--- | :--- | :--- | :---
serverHost | string | the hostname of the server if not the same as the client | same as client
defaultNumRetries | number | Number of times to retry a request | 3
itemsPerPage | number | Number of items to request on a get request | 100
cacheType | string | If 'memory', cache is stored in memory. If 'session', cache is stored in express the session | "memory"
cache | [Cache](https://github.com/harvard-edtech/caccl-api/blob/master/docs/Cache.md) | Custom cache manager instance. Not required if using 'memory' or 'session' cacheType (those caches are built-in) | none
sendRequest | [SendRequest](https://github.com/harvard-edtech/caccl-send-request) | a function that sends an http request. We recommend leaving this as is | [caccl-send-request](https://github.com/harvard-edtech/caccl-send-request)
apiForwardPathPrefix | string | API forwarding path prefix to add to all forwarded api requests. This is the prefix we prepend to all requests when sending them to the server for forwarding to Canvas. This config option _must be the same on the server and client_ | /canvas

<hr>

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

**Note:** configuration options are _optional_ unless otherwise stated. These configuration options only affect API requests made on the client, not those made via `req.api` on the server.

Config Option | Type | Description | Default
:--- | :--- | :--- | :---
defaultNumRetries | number | the number of times to retry failed requests | 3
itemsPerPage | number | the number of items to request on a get request | 100
cacheType | string | if 'memory', cache is stored in memory. If 'session', cache is stored in the express session. To include a custom cache, include it using the "cache" config option | none
cache | [Cache](https://github.com/harvard-edtech/caccl-api/blob/master/contributor-docs/Cache.md) | a custom cache instance (Not required if using 'memory' or 'session' cacheType: those caches are built-in) | none

<hr>

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

#### Configuring CACCL on the Server

To change the default canvasHost, edit the value in `/config/canvasDefaults.js`.

To customize other aspects of how CACCl functions on the server, edit the configuration options being passed into `initCACCL(...)` in `index.js`:

_Configuration for Express server:_

> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> sessionSecret | string | the session secret to use when encrypting sessions | random string
> cookieName | string | the cookie name to sent to client's browser | "CACCL-based-app-session-[timestamp]-[random str]"
> sessionMins | number | the number of minutes the session should last for | 360 (6 hours)
> onListenSuccess | function | function to call when server starts listening | `console.log`
> onListenFail | function | function to call if server can't start listening | `console.log`
> sslKey | string | ssl key or filename where key is stored | self-signed certificate key
> sslCertificate | string | ssl certificate or filename where certificate is stored | self-signed certificate
> sslCA | string[] or string | certificate chain linking a certificate authority to our ssl certificate. If type is string, certificates will automatically be split | none
> clientOrigin | string | the origin host of the client (to allow CORS), if different from server host | none
> 
> If for any reason you want to **create the express server yourself**, just pass it in (see below). Note: If you pass in your own express server, all customization options above will be ignored. When creating your express server, make sure you initialize body parsing and express-session.
> 
> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> app | express server app | the express app to add routes to | optional | new express app

_Configuration for API access:_

> If your app doesn't need to access the Canvas API, set `disableServerSideAPI: true`.
> 
> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> disableServerSideAPI | boolean | if false, adds `req.api` to routes encapsulated by routesWithAPI | `false`
> routesWithAPI | string[] | list of routes to add api support to, `*` wildcard supported | all routes
> cacheType | string | if 'memory', cache is stored in memory. If 'session', cache is stored in the express session. To include a custom cache, include it using the "cache" config option | none
> cache | [Cache](https://github.com/harvard-edtech/caccl-api/blob/master/contributor-docs/Cache.md) | a custom cache instance (Not required if using 'memory' or 'session' cacheType (those caches are built-in) | none
> dontUseLaunchCanvasHost | boolean | if false, when a user launches the app via LTI, we use the LTI launch host as the canvasHost | `false`
> sendRequest | [SendRequest](https://github.com/harvard-edtech/caccl-send-request) | a function that sends an http request. We recommend leaving this as is | [caccl-send-request](https://github.com/harvard-edtech/caccl-send-request)
> accessToken | string | a default access token to apply to all requests, overridden by user's access token | none
> defaultNumRetries | number | the number of times to retry failed requests | 3
> itemsPerPage | number | the number of items to request on a get request | 100

_Configuration for Canvas authorization:_

> To access the Canvas API, we need an access token. CACCL gets the user's access token through Canvas' OAuth 2 authorization process. All you need to do is redirect the user to the launchPath and CACCL will perform the authorization process. If `disableAuthorizeOnLaunch` is false (see config for LTI launch), we authorize the user on launch.
>
> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> disableAuthorization | boolean | if false, sets up automatic authorization when the user visits the launchPath | `false`
> developerCredentials | object | Canvas app developer credentials in the form `{ client_id, client_secret }. _Required_ unless disableAuthorization is true | none
> defaultAuthorizedRedirect | string | the default route to redirect the user to after authorization is complete (you can override this for a specific authorization call by including `next=/path` as a query or body parameter when sending user to the launchPath) | "/"
> tokenStore | [TokenStore](https://github.com/harvard-edtech/caccl-authorizer/blob/master/docs/TokenStore.md) | null to turn off storage of refresh tokens or custom token store of form `{ get(key), set(key, val) }` where both get and set functions return promises | memory token store
> simulateLaunchOnAuthorize | boolean | if true, simulates an LTI launch upon successful authorization (if user hasn't already launched via LTI), essentially allowing users to launc the tool by visiting the launchPath (GET). _Note:_ `simulateLaunchOnAuthorize` is not valid unless `disableAuthorization`, `disableLTI`, and `disableServerSideAPI` are all false. | `false`

_Configuration for LTI launches:_

> CACCL automatically accepts LTI launch requests and parses the launch request body. If your app is not launched via LTI, you can turn off this feature using `disableLTI: true`.
> 
> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> disableLTI | boolean | if false, CACCL listens for and parses LTI launches | false
> installationCredentials | object | installation consumer credentials to use to verify LTI launch requests in the form `{ consumer_key, consumer_secret }`. _Required:_ `installationCredentials` is _required_ unless `disableLTI` is true.
> redirectToAfterLaunch | string | the path to redirect to after a successful launch | "/"
> nonceStore | object | a nonce store instance to use for keeping track of nonces of the form `{ check }` where `check` is a function: (nonce, timestamp) => Promise that resolves if valid, rejects if invalid
> disableAuthorizeOnLaunch | boolean | if false, user is automatically authorized upon launch. _Note:_ `disableAuthorizeOnLaunch` is not valid unless `disableAuthorization` and `disableServerSideAPI` are false. | `false`

## Manual Set Up:

You'll need CACCL set up on your server and client. See the following guides:

- [Using CACCL on an Express Server](https://github.com/harvard-edtech/caccl/blob/master/docs/server.md)
- [Using CACCL on a Client](https://github.com/harvard-edtech/caccl/blob/master/docs/client.md)
