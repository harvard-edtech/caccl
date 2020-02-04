# CACCL

The **C**anvas **A**pp **C**omplete **C**onnection **L**ibrary (CACCL) is an all-in-one library for building Canvas-integrated apps. By handling LTI, authorization, and API for you, CACCL makes building Canvas-integrated tools quick and easy.

## This project is in Beta:

This project is still in Beta. Breaking changes may occur at any time. Please be careful when updating your version of CACCL.

## No Windows support:

This project was developed to be run in a Mac or Linux environment. If you must develop in Windows, try [installing bash](https://www.google.com/search?q=install+linux+bash+on+windows), but understand that we do not test CACCL in Windows...so no guarantees this will work.

# Quickstart

## Initialize your Project

#### 1. Create a new project:

In an empty directory or npm project directory, run:

`npm init caccl`

You'll be prompted with a list of project types. Choose a type and follow instructions.

Project Type | Client | Description
:--- | :--- | :---
React + Express App | React | React front-end with a simple Express back-end
Node.js Script | Terminal |  A simple Node.js script that runs in terminal
EJS + Express Server-side App | EJS Templates | A server-side app with an Express server and UI templating with EJS

**Project type not listed?** If your type of project isn't listed above or you are creating a tool that only needs access to the Canvas API, see the [Manual Set Up](#manual-set-up) section.

#### 2. Read the docs for your project type:

Once you've chosen from the list, follow instructions and jump to the corresponding docs:

- [React + Express App Docs](#if-you-chose-react--express-app)
- [Node.js Script](#if-you-chose-nodejs-script)
- [EJS + Express Server-side App](#if-you-chose-ejs--express-server-side-app)



## If you chose _React + Express App_...

#### Table of Contents

- [Developer Mode](#developer-mode)
- [Back-end](#back-end)
- [Front-end](#front-end)
- [Configuring CACCL on the Server](#configuring-caccl-on-the-server)
- [Configuring CACCL on the Client](#configuring-caccl-on-the-client)
- [Adding Your App to Canvas](#adding-your-app-to-canvas)
- [Deploying your App](#deploying-your-app)

#### Developer Mode

To **start your app in developer mode**, open three terminal windows in the project root directory. Run each of the following commands, one in each window:

- `npm run dev:canvas` – starts a Canvas launch simulator
- `npm run dev:server` – starts the app server
- `npm run dev:client` – starts React's live dev environment

**Launch:** to simulate an LTI launch for your app, see instructions in the first window (Canvas simulator).

_FAQ: Which port will my app listen to?_

> By default, we use port 443.
>
> To choose a specific port, either set the "PORT" environment variable or add a `port` configuration option when calling `initCACCL` (see [Configuring CACCL on the Server](#configuring-caccl-on-the-server))

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

_Get Info on Status, Auth, and LTI Launch:_

> CACCL stores status, auth, and LTI launch info in the user's session. See the following properties of `req.session`:
>
> Property | Type | Description
> :--- | :--- | :---
> launched | boolean | if true, the user successfully launched the app via LTI
> authorized | boolean | if true, we have authorization to access the Canvas API
> authFailed | boolean | true if authorization failed
> authFailureReason | string | the reason authorization failed if `authFailed` is true (see reasons list below)
> launchInfo | object | included if `launched` is true, see [launchInfo docs](https://github.com/harvard-edtech/caccl-lti/blob/master/docs/LaunchInfo.md) for full list of properties
>
> **Note:** see [launchInfo docs](https://github.com/harvard-edtech/caccl-lti/blob/master/docs/LaunchInfo.md) for more on the `launchInfo` property.
>
> Possible values of `authFailureReason`:
>
> - "error" - a Canvas error occurred: Canvas responded erratically during the authorization process
> - "internal_error" - an internal error occurred on the server while attempting to process authorization
> - "denied" - the user denied the app access to Canvas when they were prompted
> - "invalid_client" - the app's client_id is invalid: the app is not approved to interact with Canvas

_Grade Passback:_

> CACCL supports LTI-based grade passback when the user was launched through an external assignment. If the user launched this way, you will be able to use the `sendPassback` function on the server to pass grade, timestamp, and/or submission data back to Canvas:
>
> In any server route, use the `req.sendPassback` function with the following parameters:
>
> Property | Type | Description
> :--- | :--- | :---
> score | number | the number of points to give the student. Either this or `percent` can be included, but not both
> percent | number | the percent of the points possible to give the student. Either this or `score` can be included, but not both
> text | string | the student's text submission. Either this or `url` can be included, but not both
> url | string | the student's url submission. Either this or `text` can be included, but not both
> submittedAt | Date or ISO 8601 string | the submittedAt timestamp for the submission
>
> Example 1: on this 20 point assignment, give the student 15 points and send their text submission
>
> ```js
> await req.sendPassback({
>   score: 15,
>   text: 'This is my submission',
> });
> ```
>
> Example 2: on this 20 point assignment, give the student 15 points and send their url submission
>
> ```js
> await req.sendPassback({
>   percent: 75,
>   url: 'https://student.sub/is/this/link',
> });
> ```

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
>   sendPassback,
> } = initCACCL();
> ```
>
> See each section below on how to use `api`, `getStatus`, `sendRequest`, and `sendPassback`.

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

_Get Info on Status, Auth, and LTI Launch:_

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
> authFailed | boolean | true if authorization failed
> authFailureReason | string | the reason authorization failed if `authFailed` is true (see reasons list below)
> launchInfo | object | included if `launched` is true, see [launchInfo docs](https://github.com/harvard-edtech/caccl-lti/blob/master/docs/LaunchInfo.md) for full list of properties
>
> **Note:** see [launchInfo docs](https://github.com/harvard-edtech/caccl-lti/blob/master/docs/LaunchInfo.md) for more on the `launchInfo` property.
>
> Possible values of `authFailureReason`:
>
> - "error" - a Canvas error occurred: Canvas responded erratically during the authorization process
> - "internal_error" - an internal error occurred on the server while attempting to process authorization
> - "denied" - the user denied the app access to Canvas when they were prompted
> - "invalid_client" - the app's client_id is invalid: the app is not approved to interact with Canvas

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

_Grade Passback:_

> CACCL supports LTI-based grade passback on the front-end when the user was launched through an external assignment and when the server has `disableClientSidePassback` set to `false` (this is the default). Use the `sendPassback` function provided by `initCACCL` to pass grade, timestamp, and/or submission data back to Canvas:
>
> In any React component, use `sendPassback` with the following parameters:
>
> Property | Type | Description
> :--- | :--- | :---
> score | number | the number of points to give the student. Either this or `percent` can be included, but not both
> percent | number | the percent of the points possible to give the student. Either this or `score` can be included, but not both
> text | string | the student's text submission. Either this or `url` can be included, but not both
> url | string | the student's url submission. Either this or `text` can be included, but not both
> submittedAt | Date or ISO 8601 string | the submittedAt timestamp for the submission
>
> Example 1: on this 20 point assignment, give the student 15 points and send their text submission
>
> ```js
> await sendPassback({
>   score: 15,
>   text: 'This is my submission',
> });
> ```
>
> Example 2: on this 20 point assignment, give the student 15 points and send their url submission
>
> ```js
> await sendPassback({
>   percent: 75,
>   url: 'https://student.sub/is/this/link',
> });
> ```

#### Configuring CACCL on the Server

To change the default canvasHost in your dev environment, edit the value in `config/devEnvironment.js`. To change this in your production environment, see the section on [deploying your app](#deploying-your-app).

To customize other aspects of how CACCl functions on the server, edit the configuration options being passed into `initCACCL(...)` in `index.js`:

_Configuration for Express server:_

> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> port | number | the port to listen to | "PORT" environment var or 443
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
> developerCredentials | object | Canvas app developer credentials in the form `{ client_id, client_secret }`. No need to include this in your dev environment (the default value is what we expect) | `{ client_id: 'client_id', client_secret: 'client_secret' }` (our dummy vals for dev environment)
> defaultAuthorizedRedirect | string | the default route to redirect the user to after authorization is complete (you can override this for a specific authorization call by including `next=/path` as a query or body parameter when sending user to the launchPath) | "/"
> tokenStore | [TokenStore](https://github.com/harvard-edtech/caccl-authorizer/blob/master/docs/TokenStore.md) | include a custom token store (see [TokenStore docs](https://github.com/harvard-edtech/caccl-authorizer/blob/master/docs/TokenStore.md) for specs) | memory token store
> simulateLaunchOnAuthorize | boolean | if true, simulates an LTI launch upon successful authorization (if user hasn't already launched via LTI), essentially allowing users to launc the tool by visiting the launchPath (GET). _Note:_ `simulateLaunchOnAuthorize` is not valid unless `disableAuthorization`, `disableLTI`, and `disableServerSideAPI` are all false. | `false`

_Configuration for LTI launches:_

> CACCL automatically accepts LTI launch requests and parses the launch request body. If your app is not launched via LTI, you can turn off this feature using `disableLTI: true`.
>
> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> disableLTI | boolean | if false, CACCL listens for and parses LTI launches | false
> installationCredentials | object | installation consumer credentials to use to verify LTI launch requests in the form `{ consumer_key, consumer_secret }`. No need to include this in your dev environment (the default value is what we expect) | `{ consumer_key: 'consumer_key', consumer_secret: 'consumer_secret' }` (our dummy vals for dev environment)
> redirectToAfterLaunch | string | the path to redirect to after a successful launch | "/"
> nonceStore | object | a nonce store instance to use for keeping track of nonces of the form `{ check }` where `check` is a function: (nonce, timestamp) => Promise that resolves if valid, rejects if invalid
> disableAuthorizeOnLaunch | boolean | if false, user is automatically authorized upon launch. _Note:_ `disableAuthorizeOnLaunch` is not valid unless `disableAuthorization` and `disableServerSideAPI` are false. | `false`
> disableClientSidePassback | boolean | if falsy, the client app cannot send grade passback to Canvas. If this is set to true, grade passback requests must be made from the server. Note: leaving this as false is convenient but does make it possible for clever users to spoof a grade passback request | `false`

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
apiForwardPathPrefix | string | API forwarding path prefix to add to all forwarded API requests. This is the prefix we prepend to all requests when sending them to the server for forwarding to Canvas. This config option _must be the same on the server and client_ | /canvas

#### Adding Your App to Canvas

Once you've built your app and have finished tested simulating LTI launches using our [developer mode](#developer-mode) tools, you can install your app into Canvas to test it out.

Just follow these steps:

##### 1. Set up your installationCredentials

_a. Generate your installationCredentials_

> Use a random string generator to create your app's `consumer_key` and `consumer_secret`.
>
> Example:

> `consumer_key: '32789ramgps984t3n49t8ka0er9gsdflja'`
> `consumer_secret: 'sdfjklans8fn983b74n89t7b0qv9847b890cmtm3980ct7vlksjdf'`

_b. Save your installationCredentials to your production environment_

> Save your installationCredentials in a secure place. We highly recommend not checking these into git. You'll need both the `consumer_key` and `consumer_secret` when deploying your app (see the section on [deploying your app](#deploying-your-app))

##### 2. Set up your developerCredentials

If your app does not access the Canvas API...

> Make sure to set the following additional configuration options when calling `initCACCL` in your top-level `index.js` file:
>
> ```js
> initCACCL({
>   ...
>   disableAuthorization: true,
>   disableClientSideAPI: true,
>   disableServerSideAPI: true,
>   ...
> });
> ```
>
> Since your app does not access the API, you have no need for `developerCredentials`. You are done with this step.

If your app requires access to the Canvas API...

> **a. Generate a developer key for your app**
> Ask a Canvas account admin to generate a new "Developer Key" for your app, following the [How do I add a developer key for an account?](https://community.canvaslms.com/docs/DOC-12657-4214441833) instructions. Note: your `Redirect URI` should be `https://<apphostname>/launch`.
>
> Once finished, the admin will be able to find your app's `client_id` printed in plain text in the "details" column and they'll be able to get your app's `client_secret` by clicking the "Show Key" button directly below your `client_id`.
>
> **b. Keep your developerCredentials safe**
>
> Save your developerCredentials in a secure place. We highly recommend not checking these into git. You'll need both the `client_id` and `client_secret` when deploying your app (see the section on [deploying your app](#deploying-your-app))

##### 3. Deploy your app

See the section on [deploying your app](#deploying-your-app).

##### 4. Install your app into a Canvas course or account

_a. Create your app's installation XML_

> We recommend using an online tool for this step. Try googling "LTI XML Generator" or just use the [edu-apps xml generator](https://www.edu-apps.org/build_xml.html).
>
> Tips:
>  
> - Set the launch URL to `https://yourhost.com/launch` unless you changed the `launchPath` config parameter
> - We recommend adding a "Course Navigation" extension (this is the launch type we support)

_b. Install your app into Canvas_

> a. Visit your Canvas course or account
> b. Click "Settings"  
> c. Click the "Apps" tab  
> d. Click "View App Configurations"  
> e. Click "+ App"  
> f. Use the configuration type dropdown to select "Paste XML"  
> g. Fill in your app's name, consumer key, and consumer secret
> h. Paste the xml (generated in part a above) into the "XML Configuration" box  
> h. Click "Submit"  
> i. Refresh the page
>
> Now, when visiting the course (or a course in the account) you just added your app to, you'll find that the app is installed. Note: if your XML wasn't configured to enable your app by default, you may need to go into Settings > Navigation and drag your app up so it's visible.

##### 5. Launch your app via Canvas

Once you've installed your app into a course or account, visit that course (or a course in that account). If you just installed the app, you may need to refresh the course page.

If you set up your installation XML to include a navigation item _and_ your app is enabled, your app will show up in the left-hand navigation menu. Just click your app to launch it.

### Deploying your app:

##### Deploying on Heroku

1. Create a new app on Heroku
2. Set up your _Deployment method_:
> This is up to you, but here's what we think of as the easiest way to configure your Heroku app:
>
> a. Under the "Deploy" tab, choose GitHub as your "Deployment method"  
> b. Follow instructions to search for your app's repository and connect to it  
> c. We also recommend clicking "Enable Automatic Deploys" so your app re-deploys any time you push to _master_.

3. Set up your _Config Vars_:
> a. Under the "Settings" tab, find the "Config Vars" section, and click "Reveal Config Vars"  
> b. Add the following vars:   
>
> KEY | VALUE
> :--- | :---
> CONSUMER_KEY | the consumer_key from your installationCredentials
> CONSUMER_SECRET | the consumer_secret from your installationCredentials
> CANVAS_HOST | the default canvasHost to use
>
> c. If you created developerCredentials while following the steps in [Adding Your App to Canvas](#adding-your-app-to-canvas), add these vars as well:
>
> KEY | VALUE
> :--- | :---
> CLIENT_ID | the client_id from your developerCredentials
> CLIENT_SECRET | the client_secret from your developerCredentials

4. You're done! To deploy a new version of your app, just push to the _master_ branch.

If you need more info on Heroku, check out [Heroku's deployment guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app).

##### Deploying on a server (e.g. Amazon EC2)

1. Set up your server:
> We'll leave this up to you. The simplest way to do this is to add SSL certificates to your CACCL app and just upload your app code. Check out [Configuring CACCL on the Server](#configuring-caccl-on-the-server) for info on adding SSL certificates.
>
> A more secure way of doing this is to set up _nginx_ to securely listen to port _443_ and to forward traffic to _8080_. Then, your app doesn't need to have elevated privileges to listen to port _443_.

2. Add your installationCredentials:
> Save the `consumer_key` and `consumer_secret` to `config/installationCredentials.js`. **Do not add this file in your developer environment**.
>
> Example `installationCredentials.js` file:
>
> ```js
> module.exports = {
>   consumer_key: '32789ramgps984t3n49t8ka0er9gsdflja',
>   consumer_secret: 'sdfjklans8fn983b74n89t7b0qv9847b890cmtm3980ct7vlksjdf',
> };
> ```

3. Add your developerCredentials:
> Save the `client_id` and `client_secret` to `config/developerCredentials.js`. **Do not add this file in your developer environment**.
>
> Example `developerCredentials.js` file:
>
> ```js
> module.exports = {
>   client_id: '10810000000003',
>   client_secret: '389andvn7849tb5sjd098fgk08490583409m54bt73948n980548',
> };
> ```

4. Add your canvasDefaults:
> Save the default `canvasHost` value to `config/canvasDefaults.js`. **Do not add this file in your developer environment**.
>
> Example `canvasDefaults.js` file:
>
> ```js
> module.exports = {
>   canvasHost: 'canvas.harvard.edu',
> };
> ```

5. Install your app's dependencies
> Run `npm install` on the server

6. Build your app:
> Run `npm run build` on the server
>
> Alternatively, you can build your app before uploading it to the server. All up to you.

7. Start your app:
> Run `npm start` on the server
>
> You may need to grant your app higher privileges by running `sudo npm start` instead.

<hr>

## If you chose _Node.js Script_...

#### Table of Contents

- [Run your script](#run-your-script)
- [Edit your script](#edit-your-script)
- [Configuring CACCL](#configuring-caccl)

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

#### Table of Contents

- [Developer Mode](#developer-mode-1)
- [Editing your app](#editing-your-app)
- [Configuring CACCL](#configuring-caccl-1)
- [Adding Your App to Canvas](#adding-your-app-to-canvas-1)
- [Deploying your App](#deploying-your-app-1)

#### Developer Mode

To **start your app in developer mode**, open two terminal windows in the project root directory. Run each of the following commands, one in each window:

- `npm run dev:canvas` – starts a Canvas launch simulator
- `npm run dev:server` – starts the app server

**Launch:** to simulate an LTI launch for your app, see instructions in the first window (Canvas simulator).

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

_Get Info on Status, Auth, and LTI Launch:_

> CACCL stores status, auth, and LTI launch info in the user's session. See the following properties of `req.session`:
>
> Property | Type | Description
> :--- | :--- | :---
> launched | boolean | if true, the user successfully launched the app via LTI
> authorized | boolean | if true, we have authorization to access the Canvas API
> authFailed | boolean | true if authorization failed
> authFailureReason | string | the reason authorization failed if `authFailed` is true (see reasons list below)
> launchInfo | object | included if `launched` is true, see [launchInfo docs](https://github.com/harvard-edtech/caccl-lti/blob/master/docs/LaunchInfo.md) for full list of properties
>
> **Note:** see [launchInfo docs](https://github.com/harvard-edtech/caccl-lti/blob/master/docs/LaunchInfo.md) for more on the `launchInfo` property.
>
> Possible values of `authFailureReason`:
>
> - "error" - a Canvas error occurred: Canvas responded erratically during the authorization process
> - "internal_error" - an internal error occurred on the server while attempting to process authorization
> - "denied" - the user denied the app access to Canvas when they were prompted
> - "invalid_client" - the app's client_id is invalid: the app is not approved to interact with Canvas

_Grade Passback:_

> CACCL supports LTI-based grade passback when the user was launched through an external assignment. If the user launched this way, you will be able to use the `sendPassback` function on the server to pass grade, timestamp, and/or submission data back to Canvas:
>
> In any server route, use the `req.sendPassback` function with the following parameters:
>
> Property | Type | Description
> :--- | :--- | :---
> score | number | the number of points to give the student. Either this or `percent` can be included, but not both
> percent | number | the percent of the points possible to give the student. Either this or `score` can be included, but not both
> text | string | the student's text submission. Either this or `url` can be included, but not both
> url | string | the student's url submission. Either this or `text` can be included, but not both
> submittedAt | Date or ISO 8601 string | the submittedAt timestamp for the submission
>
> Example 1: on this 20 point assignment, give the student 15 points and send their text submission
>
> ```js
> await req.sendPassback({
>   score: 15,
>   text: 'This is my submission',
> });
> ```
>
> Example 2: on this 20 point assignment, give the student 15 points and send their url submission
>
> ```js
> await req.sendPassback({
>   percent: 75,
>   url: 'https://student.sub/is/this/link',
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

#### Configuring CACCL

To change the default canvasHost in your dev environment, edit the value in `config/devEnvironment.js`. To change this in your production environment, see the section on [deploying your app](#deploying-your-app-1).

To customize other aspects of how CACCl functions on the server, edit the configuration options being passed into `initCACCL(...)` in `index.js`:

_Configuration for Express server:_

> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> port | number | the port to listen to | "PORT" environment var or 443
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
> routesWithAPI | string[] | list of routes to add API support to, `*` wildcard supported | all routes
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
> developerCredentials | object | Canvas app developer credentials in the form `{ client_id, client_secret }`. No need to include this in your dev environment (the default value is what we expect) | `{ client_id: 'client_id', client_secret: 'client_secret' }` (our dummy vals for dev environment)
> defaultAuthorizedRedirect | string | the default route to redirect the user to after authorization is complete (you can override this for a specific authorization call by including `next=/path` as a query or body parameter when sending user to the launchPath) | "/"
> tokenStore | [TokenStore](https://github.com/harvard-edtech/caccl-authorizer/blob/master/docs/TokenStore.md) | include a custom token store (see [TokenStore docs](https://github.com/harvard-edtech/caccl-authorizer/blob/master/docs/TokenStore.md) for specs) | memory token store
> simulateLaunchOnAuthorize | boolean | if true, simulates an LTI launch upon successful authorization (if user hasn't already launched via LTI), essentially allowing users to launc the tool by visiting the launchPath (GET). _Note:_ `simulateLaunchOnAuthorize` is not valid unless `disableAuthorization`, `disableLTI`, and `disableServerSideAPI` are all false. | `false`

_Configuration for LTI launches:_

> CACCL automatically accepts LTI launch requests and parses the launch request body. If your app is not launched via LTI, you can turn off this feature using `disableLTI: true`.
>
> Config Option | Type | Description | Default
> :--- | :--- | :--- | :---
> disableLTI | boolean | if false, CACCL listens for and parses LTI launches | false
> installationCredentials | object | installation consumer credentials to use to verify LTI launch requests in the form `{ consumer_key, consumer_secret }`. No need to include this in your dev environment (the default value is what we expect) | `{ consumer_key: 'consumer_key', consumer_secret: 'consumer_secret' }` (our dummy vals for dev environment)
> redirectToAfterLaunch | string | the path to redirect to after a successful launch | "/"
> nonceStore | object | a nonce store instance to use for keeping track of nonces of the form `{ check }` where `check` is a function: (nonce, timestamp) => Promise that resolves if valid, rejects if invalid
> disableAuthorizeOnLaunch | boolean | if false, user is automatically authorized upon launch. _Note:_ `disableAuthorizeOnLaunch` is not valid unless `disableAuthorization` and `disableServerSideAPI` are false. | `false`
> disableClientSidePassback | boolean | if falsy, the client app cannot send grade passback to Canvas. If this is set to true, grade passback requests must be made from the server. Note: leaving this as false is convenient but does make it possible for clever users to spoof a grade passback request | `false`

#### Adding Your App to Canvas

Once you've built your app and have finished tested simulating LTI launches using our [developer mode](#developer-mode-1) tools, you can install your app into Canvas to test it out.

Just follow these steps:

##### 1. Set up your installationCredentials

_a. Generate your installationCredentials_

> Use a random string generator to create your app's `consumer_key` and `consumer_secret`.
>
> Example:

> `consumer_key: '32789ramgps984t3n49t8ka0er9gsdflja'`
> `consumer_secret: 'sdfjklans8fn983b74n89t7b0qv9847b890cmtm3980ct7vlksjdf'`

_b. Save your installationCredentials to your production environment_

> Save the `consumer_key` and `consumer_secret_ to `config/installationCredentials.js` **only in your production environment**
>
> Example:
>
> ```js
> module.exports = {
>   consumer_key: '32789ramgps984t3n49t8ka0er9gsdflja',
>   consumer_secret: 'sdfjklans8fn983b74n89t7b0qv9847b890cmtm3980ct7vlksjdf',
> };
> ```
>
> Do not edit this file in your development environment! In your development environment, your `installationCredentials.js` file should have `consumer_key: 'consumer_key'` and `consumer_secret: 'consumer_secret'` (our dummy developer environment values)

##### 2. Set up your developerCredentials

If your app does not access the Canvas API...

> Make sure to set the following additional configuration options when calling `initCACCL` in your top-level `index.js` file:
>
> ```js
> initCACCL({
>   ...
>   disableAuthorization: true,
>   disableClientSideAPI: true,
>   disableServerSideAPI: true,
>   ...
> });
> ```
>
> Since your app does not access the API, you have no need for `developerCredentials`. You are done with this step.

If your app requires access to the Canvas API...

> **a. Generate a developer key for your app**
>
> Ask a Canvas account admin to generate a new "Developer Key" for your app, following the [How do I add a developer key for an account?](https://community.canvaslms.com/docs/DOC-12657-4214441833) instructions. Note: your `Redirect URI` should be `https://<apphostname>/launch`.
>
> Once finished, the admin will be able to find your app's `client_id` printed in plain text in the "details" column and they'll be able to get your app's `client_secret` by clicking the "Show Key" button directly below your `client_id`.
>
> **b. Save your developerCredentials to your production environment**
>
> In your production environment only, edit your `config/developerCredentials.js` file and add your `client_id` and `client_secret`.
>
> Example:
>
> ```js
> module.exports = {
>   client_id: '10810000000003',
>   client_secret: '389andvn7849tb5sjd098fgk08490583409m54bt73948n980548',
> };
> ```
>
> Do not edit this file in your developer environment! In your development environment, your `developerCredentials.js` file should have `client_id: 'client_id'` and `client_secret: 'client_secret'` (our dummy developer environment values)

##### 3. Install your app into a Canvas course or account

_a. Create your app's installation XML_

> We recommend using an online tool for this step. Try googling "LTI XML Generator" or just use the [edu-apps xml generator](https://www.edu-apps.org/build_xml.html).
>
> Tips:
>  
> - Set the launch URL to `https://yourhost.com/launch` unless you changed the `launchPath` config parameter
> - We recommend adding a "Course Navigation" extension (this is the launch type we support)

_b. Install your app into Canvas_

> a. Visit your Canvas course or account
> b. Click "Settings"  
> c. Click the "Apps" tab  
> d. Click "View App Configurations"  
> e. Click "+ App"  
> f. Use the configuration type dropdown to select "Paste XML"  
> g. Fill in your app's name, consumer key, and consumer secret
> h. Paste the xml (generated in part a above) into the "XML Configuration" box  
> h. Click "Submit"  
> i. Refresh the page
>
> Now, when visiting the course (or a course in the account) you just added your app to, you'll find that the app is installed. Note: if your XML wasn't configured to enable your app by default, you may need to go into Settings > Navigation and drag your app up so it's visible.

##### 4. Deploy your app

See the section on [deploying your app](#deploying-your-app-1).

##### 5. Launch your app via Canvas

Once you've installed your app into a course or account, visit that course (or a course in that account). If you just installed the app, you may need to refresh the course page.

If you set up your installation XML to include a navigation item _and_ your app is enabled, your app will show up in the left-hand navigation menu. Just click your app to launch it.

### Deploying your app:

##### Deploying on Heroku

1. Create a new app on Heroku
2. Set up your _Deployment method_:
> This is up to you, but here's what we think of as the easiest way to configure your Heroku app:
>
> a. Under the "Deploy" tab, choose GitHub as your "Deployment method"  
> b. Follow instructions to search for your app's repository and connect to it  
> c. We also recommend clicking "Enable Automatic Deploys" so your app re-deploys any time you push to _master_.

3. Set up your _Config Vars_:
> a. Under the "Settings" tab, find the "Config Vars" section, and click "Reveal Config Vars"  
> b. Add the following vars:   
>
> KEY | VALUE
> :--- | :---
> CONSUMER_KEY | the consumer_key from your installationCredentials
> CONSUMER_SECRET | the consumer_secret from your installationCredentials
> CANVAS_HOST | the default canvasHost to use
>
> c. If you created developerCredentials while following the steps in [Adding Your App to Canvas](#adding-your-app-to-canvas-1), add these vars as well:
>
> KEY | VALUE
> :--- | :---
> CLIENT_ID | the client_id from your developerCredentials
> CLIENT_SECRET | the client_secret from your developerCredentials

4. You're done! To deploy a new version of your app, just push to the _master_ branch.

If you need more info on Heroku, check out [Heroku's deployment guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app).

##### Deploying on a server (e.g. Amazon EC2)

1. Set up your server:
> We'll leave this up to you. The simplest way to do this is to add SSL certificates to your CACCL app and just upload your app code. Check out [Configuring CACCL](#configuring-caccl-1) for info on adding SSL certificates.
>
> A more secure way of doing this is to set up _nginx_ to securely listen to port _443_ and to forward traffic to _8080_. Then, your app doesn't need to have elevated privileges to listen to port _443_.

2. Add your installationCredentials:
> Save the `consumer_key` and `consumer_secret` to `config/installationCredentials.js`. **Do not add this file in your developer environment**.
>
> Example `installationCredentials.js` file:
>
> ```js
> module.exports = {
>   consumer_key: '32789ramgps984t3n49t8ka0er9gsdflja',
>   consumer_secret: 'sdfjklans8fn983b74n89t7b0qv9847b890cmtm3980ct7vlksjdf',
> };
> ```

3. Add your developerCredentials:
> Save the `client_id` and `client_secret` to `config/developerCredentials.js`. **Do not add this file in your developer environment**.
>
> Example `developerCredentials.js` file:
>
> ```js
> module.exports = {
>   client_id: '10810000000003',
>   client_secret: '389andvn7849tb5sjd098fgk08490583409m54bt73948n980548',
> };
> ```

4. Add your canvasDefaults:
> Save the default `canvasHost` value to `config/canvasDefaults.js`. **Do not add this file in your developer environment**.
>
> Example `canvasDefaults.js` file:
>
> ```js
> module.exports = {
>   canvasHost: 'canvas.harvard.edu',
> };
> ```

5. Install your app's dependencies
> Run `npm install` on the server

6. Build your app:
> Run `npm run build` on the server
>
> Alternatively, you can build your app before uploading it to the server. All up to you.

7. Start your app:
> Run `npm start` on the server
>
> You may need to grant your app higher privileges by running `sudo npm start` instead.

## Manual Set Up:

### I'm Creating a Tool that Only Needs Access to the Canvas API...

This section is only relevant if your tool already has a Canvas access token. In other words, your tool either doesn't need to handle LTI launches or Canvas authorization to get users' access tokens, or your tool handles LTI and Canvas authorization on its own.

Your tool only needs to import [caccl-api](https://harvard-edtech.github.io/caccl-api/#use-caccl-api-manually-), one sub-component of CACCL. View [the caccl-api docs](https://harvard-edtech.github.io/caccl-api/#use-caccl-api-manually-) and scroll down to the "[Use CACCL API Manually](https://harvard-edtech.github.io/caccl-api/#use-caccl-api-manually-)" section.

### I'm Setting up a Custom Project...

You'll need CACCL set up on your server and client (if you have a client). See the following guides:

Building your custom app:

- [Using CACCL on an Express Server](https://github.com/harvard-edtech/caccl/blob/master/docs/server.md)
- [Using CACCL on a Client](https://github.com/harvard-edtech/caccl/blob/master/docs/client.md)

Testing your custom app:

- [Easier testing with a partially simulated Canvas environment](https://github.com/harvard-edtech/caccl/blob/master/docs/testing_custom_project.md)
