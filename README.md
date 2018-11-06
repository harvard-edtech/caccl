# CACCL
The **C**anvas **A**pp **C**omplete **C**onnection **L**ibrary (CACCL): an all-in-one library for connecting your app to Canvas, handling lti, access tokens, and api.

## Quickstart: Script

```js
const initCACCL = require('caccl');

// Create new API instance
const api = initCACCL({
  type: 'script',
  accessToken: '1958~9aefr387xnals0357asdnaybd9bs6dfads9fhdjkhabsdfv',
  canvasHost: 'canvas.harvard.edu',
});

// Example: list course enrollments
api.course.listEnrollment({ courseId: 95810 })
  .then((enrollments) => {
    // Do something with the enrollments
  });
```

## Quickstart: Express App

```js
const initCACCL = require('caccl');

// Initialize CACCL, let it create our express app for us
const app = initCACCL({
  type: 'server',
  cacheType: 'session',
  developerCredentials: secureArea.devCreds,
  
});
```

## Quickstart: Express App + Front-end (React, Vue, etc)
