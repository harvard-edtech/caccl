# Client

With CACCL, it's easy to connect your front-end client to Canvas.

Quickstart:

```js
const initCACCL = require('caccl/client');

const api = initCACCL();

// Example: list students in a course
api.course.listStudents({ courseId: 95810 })
  .then((students) => {
    // Do something
  });
```

See [the caccl-api project](https://github.com/harvard-edtech/caccl-api) for more info on using the `api` instance and a list of all supported Canvas endpoints.

## Configuration Options

When initializing CACCL, you can pass in many different configuration options to customize CACCL's behavior or turn on/off certain functionality.

**Note:** configuration options are _optional_ unless otherwise stated

Config Option | Type | Description | Default
:--- | :--- | :--- | :---
serverHost | string | the hostname of the server | same as client
defaultNumRetries | number | Number of times to retry a request | 3
defaultItemsPerPage | number | Number of items to request on a get request | 100
cacheType | string | If 'memory', cache is stored in memory. If 'session', cache is stored in express the session | "memory"
cache | object | Custom cache manager instance. Not required if using 'memory' or 'session' cacheType (those caches are built-in) | none
sendRequest | function | Function that sends a request to the Canvas API. Defaults to axios-based request sender (which we recommend) | axios
apiForwardPathPrefix | string | API forwarding path prefix to add to all forwarded api requests. This is the prefix we prepend to all requests when sending them to the server for forwarding to Canvas. This config option _must be the same on the server and client_ | /canvas