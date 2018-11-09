# CACCL
The **C**anvas **A**pp **C**omplete **C**onnection **L**ibrary (CACCL): an all-in-one library for connecting your script or app to Canvas. By handling LTI, access tokens, and api for you, CACCL makes building Canvas tools quick and easy.


## Quickstart: Express App

On the server:

```js
const initCACCL = require('caccl');

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
const initCACCL = require('caccl');

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