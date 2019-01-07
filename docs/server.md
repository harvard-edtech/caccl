# Server

Quickstart:

```js
const initCACCL = require('caccl/server');

const app = initCACCL({
    canvasHost: 'canvas.myschool.edu',
    developerCredentials: secureConfig.developerCredentials,
    installationCredentials: secureConfig.installationCredentials,
});
```

# Configuration Options

When initializing CACCL, you can pass in many different configuration options to customize CACCL's behavior or turn on/off certain functionality.

**Note:** configuration options are _optional_ unless otherwise stated

### Express Configuration

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

CACCL supports both server-side and client-side access to the Canvas API.

On the server, this happens within the express route handler via `req.api`:

```js
app.get('/my_route', (req, res) => {
    req.api.course.listStudents({ courseId: 58392 })
        .then((students) => {
            // Do something
        })
        .catch((err) => {
            res.status(500).send(err.message);
        });
});
```

On the client, CACCL hands back an `api` instance that is set to forward requests through the server.

Either way, see the [caccl-api](https://github.com/harvard-edtech/caccl-api) project for a list of endpoints and guides on using the `api` instance.

#### General API configuration:

Config Option | Type | Description | Default
:--- | :--- | :--- | :--- | :--- | :---
canvasHost | string | a default Canvas host to use for requests | canvas.instructure.com
dontUseLaunchCanvasHost | boolean | if false, when a user launches the app via LTI, we use the LTI launch host as the canvasHost | `false`
accessToken | string | a default access token to apply to all requests | none
sendRequest | function | a function that sends a request to the Canvas API | axios-based request sender
defaultNumRetries | number | the number of times to retry failed requests | 3
defaultItemsPerPage | number | the number of items to request on a get request | 100

#### Server-side API configuration:

Server-side logic can access the Canvas API easily: when handling a request to one of the routes covered by `routesWithAPI`, use `req.api` to access API functionality (see [caccl-api](https://github.com/harvard-edtech/caccl-api) for guides). If the server doesn't need access to the API, set `disableServerSideAPI = true`.

Config Option | Type | Description | Default
:--- | :--- | :--- | :--- | :--- | :---
disableServerSideAPI | boolean | if false, adds `req.api` to routes encapsulated by routesWithAPI | `false`
routesWithAPI | string[] | list of routes to add api support to, `*` wildcard supported | all routes
cacheType | string | if 'memory', cache is stored in memory. If 'session', cache is stored in the express session. To include a custom cache, include it using the "cache" config option | none
cache | object | a custom cache instance (Not required if using 'memory' or 'session' cacheType (those caches are built-in) | none

#### Client-side API forwarding configuration:

Client-side logic must access the Canvas API by forwarding requests through the server. You can customize that process below, or turn it off if the client does not need access to the API: `disableClientSideAPI = true`.

Config Option | Type | Description | Default
:--- | :--- | :--- | :--- | :--- | :---
disableClientSideAPI | boolean | if false, server forwards Canvas API requests | `false`
apiForwardPathPrefix | string | API forwarding path prefix to add to all forwarded api requests. This is the prefix we use to listen for forwarded requests (ex: GET /api/v1/courses is forwarded through the server's /canvas/api/v1/courses route if this is set to "/canvas") | "/canvas"

**Note:** `apiForwardPathPrefix` must have the same value on both the server and client. We recommend just leaving this as the default "/canvas"

### Authorization Configuration

To access the Canvas API, we need an access token. The best way to acquire one is through Canvas' OAuth 2 authorization process, which CACCL takes care of for you. All you need to do is redirect the user to the launchPath and CACCL will perform the authorization process.

**Requirement:** `developerCredentials` is _required_ unless `disableAuthorization` is true.

Config Option | Type | Description | Default
:--- | :--- | :--- | :--- | :--- | :---
disableAuthorization | boolean | if false, sets up automatic authorization when the user visits the launchPath | `false`
developerCredentials | object | Canvas app developer credentials in the form `{ client_id, client_secret }` | none
defaultAuthorizedRedirect | string | the default route to redirect the user to after authorization is complete (you can override this for a specific authorization call by including `next=/path` as a query or body parameter when sending user to the launchPath) | "/"
tokenStore | object | null to turn off storage of refresh tokens or custom token store of form `{ get(key), set(key, val) }` where both get and set functions return promises | memory token store
simulateLaunchOnAuthorize | boolean | if true, simulates an LTI launch upon successful authorization (if user hasn't already launched via LTI), essentially allowing users to launc the tool by visiting the launchPath (GET) | `false`

**Note:** `simulateLaunchOnAuthorize` is not valid unless `disableAuthorization`, `disableLTI`, and `disableServerSideAPI` are all false.

### LTI Configuration

CACCL automatically accepts LTI launch requests and parses the launch request body. If your app is not launched via LTI, you can turn off this feature using `disableLTI = true`.

**Requirement:** `installationCredentials` is _required_ unless `disableLTI` is true.

Config Option | Type | Description | Default
:--- | :--- | :--- | :--- | :--- | :---
disableLTI | boolean | if false, CACCL listens for and parses LTI launches | false
installationCredentials | object | installation consumer credentials to use to verify LTI launch requests in the form `{ consumer_key, consumer_secret }`
redirectToAfterLaunch | string | the path to redirect to after a successful launch | "/"
nonceStore | object | a nonce store instance to use for keeping track of nonces of the form `{ check }` where `check` is a function: (nonce, timestamp) => Promise that resolves if valid, rejects if invalid
disableAuthorizeOnLaunch | boolean | if false, user is automatically authorized upon launch | `false`

**Note:** `disableAuthorizeOnLaunch` is not valid unless `disableAuthorization` and `disableServerSideAPI` are false.
