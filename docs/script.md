# Script

With CACCL, it's easy to write a Node.js script that interacts with Canvas.

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

See [the caccl-api project](https://github.com/harvard-edtech/caccl-api) for more info on using the `api` instance and a list of all supported Canvas endpoints.

## Configuration Options

When initializing CACCL, you can pass in many different configuration options to customize CACCL's behavior or turn on/off certain functionality.

**Note:** configuration options are _optional_ unless otherwise stated

Config Option | Type | Description | Default
:--- | :--- | :--- | :--- | :--- | :---
canvasHost | string | a default Canvas host to use for requests | canvas.instructure.com
accessToken | string | a default access token to apply to all requests | none
sendRequest | function | a function that sends a request to the Canvas API | axios-based request sender
defaultNumRetries | number | the number of times to retry failed requests | 3
defaultItemsPerPage | number | the number of items to request on a get request | 100
cacheType | string | if 'memory', cache is stored in memory. If 'session', cache is stored in the express session. To include a custom cache, include it using the "cache" config option | none
cache | object | a custom cache instance (Not required if using 'memory' or 'session' cacheType (those caches are built-in) | none
