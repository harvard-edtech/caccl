# CACCL
The **C**anvas **A**pp **C**omplete **C**onnection **L**ibrary (CACCL): an all-in-one library for connecting your script or app to Canvas. By handling LTI, authorization, and api for you, CACCL makes building Canvas tools quick and easy.

## Script

Quickstart:

```js
const initCACCL = require('caccl/script');

const api = initCACCL({
    accessToken: secureConfig.accessToken,
    canvasHost: 'canvas.university.edu',
});

// Example: list students in a course
api.course.listStudents({ courseId: 95810 })
  .then((students) => {
    // Do something
  });
```

## Server

Quickstart:

```js
const initCACCL = require('caccl/server');

const app = initCACCL({
});
```

### Express Configuration

Note: all configuration options are optional.

Config Option | Type | Description | Default
:--- | :--- | :--- | :--- | :---
sessionSecret | string | the session secret to use when encrypting sessions | random string
cookieName | string | the cookie name to sent to client's browser | "CACCL-based-app-session-[timestamp]-[random str]"
sessionMins | number | the number of minutes the session should last for | 360 (6 hours)
onListenSuccess | function | function to call when server starts listening | `console.log`
onListenFail | function | function to call if server can't start listening | `console.log`
sslKey | string | ssl key or filename where key is stored | self-signed certificate key
sslCertificate | string | ssl certificate or filename where certificate is stored | self-signed certificate
sslCA | string[] or string | certificate chain linking a certificate authority to our ssl certificate. If type is string, certificates will automatically be split | none
clientOrigin | string | the origin host of the client (to allow CORS), if different from server host | none

If for any reason you want to create the express server yourself, just pass it in:

Config Option | Type | Description | Default
:--- | :--- | :--- | :--- | :--- | :---
app | express server app | the express app to add routes to | optional | new express app

**Note:** If you pass in your own express server, all customization options above will be ignored. When creating your express server, make sure you initialize body parsing and express-session. 

### API Configuration

Note: all configuration options are optional.

Config Option | Type | Description | Default
:--- | :--- | :--- | :--- | :--- | :---
disableServerSideAPI | boolean | if false, adds req.api to routes encapsulated by routesWithAPI | `false`
routesWithAPI | string[] | 

 * API:
 * @param {boolean} [disableServerSideAPI] - if falsy, automatically adds
 *   req.api to routes encapsulated by routesWithAPI
 * @param {string} [accessToken] - a default access token to apply to all
 *   requests
 * @param {string} [canvasHost=canvas.instructure.com] - a default canvas host
 *   to use for all requests
 * @param {boolean} [dontUseLaunchCanvasHost] - if truthy, requests are sent to
 *   the Canvas host that the current user launched from (if available via
 *   the session)
 * @param {string} [cacheType=none] - If 'memory', cache is stored in
 *   memory. If 'session', cache is stored in express the session. To include a
 *   custom cache, include it as cache
 * @param {object} [cache] - Custom cache manager instance. Not
 *   required if using 'memory' or 'session' cacheType (those caches are
 *   built-in)
 * @param {function} [sendRequest] - Function that sends a request to
 *   the Canvas API. Defaults to axios-based request sender (which we recommend)
 * @param {number} [defaultNumRetries] - Number of times to retry a
 *   request
 * @param {number} [defaultItemsPerPage] - Number of items to request
 *   on a get request
 *
 * AUTHORIZATION:
 * @param {boolean} [disableAuthorization] - if falsy, sets up automatic
 *   authorization when the user visits authorizePath
 * @param {object} [developerCredentials] - canvas app developer credentials in
 *   the form { client_id, client_secret }. Required if authorization is enabled
 * @param {array.<string>} [routesWithAPI=['*']] - the list of routes where the
 *   api should be added to as req.api. Only valid if enableServerSideAPI is
 *   truthy
 * @param {string} [defaultAuthorizedRedirect='/'] - the
 *   default route to visit after authorization is complete (you can override
 *   this value for a specific authorization call by including query.next or
 *   body.next, a path/url to visit after completion)
 * @param {object|null} [tokenStore=memory token store] - null to turn off
 *   storage of refresh tokens, exclude to use memory token store,
 *   or include a custom token store of form { get(key), set(key, val) } where
 *   both functions return promises
 * @param {boolean} [simulateLaunchOnAuthorize] - if truthy, simulates an LTI
 *   launch upon successful authorization (if the user hasn't already launched
 *   via LTI), essentially allowing users to either launch via LTI or launch
 *   the tool by visiting launchPath (GET). If falsy, when a user visits
 *   launchPath and has not launched via LTI, they will be given an error. Not
 *   valid if authorization, lti, or server-side API is disabled
 *
 * API Forwarding:
 * @param {boolean} [disableClientSideAPI] - if falsy, adds add api forwarding
 *   (see apiForwardPathPrefix)
 * @param {string} [apiForwardPathPrefix=/canvas] - API forwarding path prefix
 *   to add to all forwarded api requests. This is the
 *   prefix we use to listen for forwarded requests (ex: /canvas/api/v1/courses)
 *
 * LTI:
 * @param {boolean} [disableLTI] - if falsy, starts listening for LTI launches
 *   at launchPath
 * @param {object} [installationCredentials] - installation consumer credentials
 *   to use to verify LTI launch requests in the form
 *   { consumer_key, consumer_secret}. Required if type is 'server'
 * @param {string} [launchPath=/launch] - the path to accept POST launch
 *   requests from Canvas
 * @param {string} [redirectToAfterLaunch=/] - the path to
 *   redirect to after a successful launch
 * @param {object} [nonceStore=memory store] - a nonce store to use for
 *   keeping track of used nonces of form { check } where check is a function:
 *   (nonce, timestamp) => Promise that resolves if valid, rejects if invalid
 * @param {boolean} [disableAuthorizeOnLaunch=false] - if falsy, user is
 *   automatically authorized upon launch. If truthy, type must be 'server' and
 *   either disableClientSideAPI or disableServerSideAPI must be falsy
 */

## Client

## Quickstart: Generic Express-served App

On the server:

```js
const initCACCL = require('caccl/server');

const app = initCACCL({
  type: 'server',

  // Authorization Setup:
  authorizeOnLaunch: true,
  developerCredentials: {
    client_id: secureConfig.client_id,
    client_secret: secureConfig.client_secret,
  },

  // LTI Setup:
  installationCredentials: {
    consumer_key: secureConfig.consumer_key,
    consumer_secret: secureConfig.consumer_secret,
  },
});

// Example: roster tool
app.get('/launch', (req, res) => {
  // Request list of students via api
  req.api.course.listStudents({
    // Use the course we launched from
    courseId: req.session.launchInfo.courseId,
  })
    .then((students) => {
      // Send list of students to user
      res.json(students);
    });
});
```

On the front-end:

```js
const initCACCL = require('caccl/client');

const api = initCACCL({
  type: 'client',
});

// Example: list course enrollments
api.course.listEnrollment({ courseId: 95810 })
  .then((enrollments) => {
    // Do something with the enrollments
  });
```

## Quickstart: Script

```js
const initCACCL = require('caccl');

// Create new API instance
const api = initCACCL({
  type: 'script',
  accessToken: secureConfig.accessToken,
  canvasHost: 'canvas.harvard.edu',
});

// Example: list course enrollments
api.course.listEnrollment({ courseId: 95810 })
  .then((enrollments) => {
    // Do something with the enrollments
  });
```