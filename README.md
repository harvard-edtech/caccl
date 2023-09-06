# CACCL

The **C**anvas **A**pp **C**omplete **C**onnection **L**ibrary (CACCL) is an all-in-one library for building Canvas-integrated apps. By handling LTI, authorization, and API for you, CACCL makes building Canvas-integrated tools quick and easy.

**Beta:** this project is in beta and breaking changes may occur at any time.

# Setup CACCL

The fastest way to get set up is to use our template app. It uses Node.js and Express.js on the back-end and React on the front-end. Both use typescript. If you'd like to set up your project manually, check out the [Manual Setup](https://harvard-edtech.github.io/caccl/#manual-setup) section.

## 1. Create Project

Make a new npm project and navigate to the top-level directory.

Then, use `npx create-caccl` and follow instructions.

Among many other updates, you should now find two folders: `server/` and `client/` which contain an Express server and a React app, respectively.

## 2. Set Up the Server

Out of the box, your CACCL app will be ready to run in development mode. Here's how to set up your server so it is ready for production.

In `server/src/index.ts`, you'll find a call to `initCACCL({ ... })`. All CACCL configuration gets passed into `initCACCL`.

### Required: Configure LTI

All CACCL apps integrate with Canvas via LTI v1.1 (LTI v1.3 coming soon). You can think of LTI as a standardized interface between Canvas and an app that integrates with Canvas. For more info on LTI, check out the [IMS Global LTI Docs](https://www.imsglobal.org/activity/learning-tools-interoperability).

#### I. Add Credentials

When your LTI app is installed into Canvas, it will be installed with installation credentials: consumer key and consumer secret (also referred to as a shared secret).

Provide your installation credential(s) to CACCL as an `lti.installationCredentials` map in the form `{ key => secret }`.

```ts
initCACCL({
  lti: {
    installationCredentials: {
      'first-key': 'first-secret',
      'second-key': 'second-secret',
      ...
    },
  },
});
```

If you only have one key/secret pair (all app installs use the same installation credentials), you can include your credentials as two environment variables instead: `CONSUMER_KEY` and `CONSUMER_SECRET`.

#### II. Choose Other Features

**Disable Authorization After Launch:** If the api is configured (see the next section) but you would not like to automatically authorize users with the API when they launch via LTI, add the `lti.dontAuthorizeAfterLaunch: true` flag. This is not a feature that's used very often, but it is useful if you _sometimes_ want users to be redirected for API authorization (perhaps you only use the API for specific features or specific users). Then, since the user will not automatically be authorized to use the API, you'll need to manually redirect the user to the authorization process (see the "redirectToAuth" function in later sections). Note: the `lti.dontAuthorizeAfterLaunch` flag is automatically set to true if the app is not set up for API integration.

```ts
initCACCL({
  lti: {
    dontAuthorizeAfterLaunch: true,
  },
});
```

**Self Launch:** Usually, LTI apps are launched by users who start in Canvas. However, if you'd like your app to be able to launch itself, CACCL has a clever self-launch process that allows your app to launch itself, given information about the Canvas instance and course. To enable this feature, add an `lti.selfLaunch` configuration object. CACCL needs to know the appId (also referred to as the external tool id) of your app as it is installed in the course that you'd like to self-launch from. For more information, see the [Enable Self Launch](https://harvard-edtech.github.io/caccl/#enable-self-launch) section. There are many ways you can share appIds with CACCL:

### Optional: Configure API

You can skip this section if your app doesn't need to access the Canvas API on behalf of the current user. If your app uses a predefined access token (not recommended), check out the [Access API via Predefined Access Token](https://harvard-edtech.github.io/caccl/#access-api-via-predefined-access-token) section.

#### I. Add Credentials

To integrate with the Canvas API, your app needs to be registered with the Canvas instance. This is something you'll need to work through with the school/university/organization and their Canvas admins. Once they approve your app and add it to their Canvas instance, you should be able to get developer credentials for the app (client id and secret).

Provide your developer credential(s) to CACCL as an `auth.developerCredentials` map in the form `{ canvasHost => { clientId, clientSecret } }`.

```ts
initCACCL({
  auth: {
    developerCredentials: {
      'canvas.harvard.edu': {
        clientId: '12340000000000000000125',
        clientSecret: 'dgha7ht29837hgasdhfa0873grasheklh287gt097a08h3ug8',
      },
    },
  },
});
```

If you only have one set of developer credentials to include, you can include your credentials as three environment variables: `DEFAULT_CANVAS_HOST`, `CLIENT_ID`, and `CLIENT_SECRET`.

#### II. Configure Client-side API

If your client-side React app accesses the Canvas API directly, you can skip this section. But if your client app does not need access to the Canvas API, you can disable it by adding the following flag:

```ts
initCACCL({
  api: {
    disableClientSideAPI: true,
  },
});
```

#### III. Add API Scopes

Sometimes, universities and schools limit the API scopes that apps are allowed to access. If your app is limited, you will need to include an array of scopes when initializing CACCL, included as `api.scopes`:

```ts
initCACCL({
  api: {
    scopes: [
      'url:GET|/api/v1/courses',
      'url:GET|/api/v1/courses/:course_id/assignments',
      ...
    ],
  },
});
```

## 3. Setup Development Mode

### Create a Sandbox Course

First, you'll need access to "sandbox course" in a real Canvas instance. You can visit [canvas.instructure.com](https://canvas.instructure.com/login/canvas) to log in or create an account. A "sandbox course" can be any Canvas course that is used for testing. We recommend adding one test teacher, at least one test TA, and at least one test student to your sandbox.

### Get Access Tokens for All Test Users

Get each test user's access token (teacher, TAs, students):

1. Log in as the user
1. Click "Account" in the top left
1. Click "Settings"
1. Scroll down to "+ Access Token"
1. Follow instructions

### Create a /config/devEnvironment.json File

From the top level of your project, create a `/config/devEnvironment.json` file and add your sandbox information:

```json
{
  "canvasHost": "canvas.harvard.edu",
  "courseId": 19248,
  "teacherAccessToken": "1234~fasdhf782egjoasidnfga8723rhfahs9d8ga7yegf",
  "taAccessTokens": [
    "1234~ncb6dhf0qe9gga6q3b48vb87df8adf787w"
  ],
  "studentAccessTokens": [
    "1234~3r5983tbtnfm28tn2898ansd928377t097",
    "1234~riout8r9e8u7y38f7a78odg8g7rgh87aer"
  ]
}
```

`canvasHost` is the hostname of the Canvas instance containing your sandbox. This is optional and defaults to `canvas.instructure.com`.

`courseId` can be found in the URL when visiting the Canvas course: `https://canvas.harvard.edu/courses/19248` where `19248` is the id.

`teacherAccessToken` is the access token for a teacher in the sandbox.

`taAccessTokens` is an optional array of access tokens for TAs in the sandbox.

`studentAccessTokens` is an optional array of access tokens for students in the sandbox.

If your app has any custom parameters that you want to include, add them in a `customParams` map:

```ts
{
  ...
  "customParams": {
    "name": "value"
    ...
  }
}
```

Remember that custom parameters cannot have capital letters. For example, `termName` is not allowed and should be replaced with simply `term` or `term_name`.

Also, we support the case where your app doesn't get launched via the `/` path. This is an unusual case, but nevertheless, it is supported by `caccl`. To include custom launch paths, simply include them in a list:

```ts
{
  ...
  customLaunchPaths: [
    {
      "name": "Cat Video Player",
      "path": "/videos/cats"
    },
    {
      "name": "Desserts Video Player",
      "path": "/videos/desserts"
    }
  ],
};
```

### Done!

You can now head over to the [Using CACCL](https://harvard-edtech.github.io/caccl/#using-caccl) section.

Check out the [Advanced Setup](https://harvard-edtech.github.io/caccl/#advanced-setup) section for more advanced configuration.

# Using CACCL

Now that your CACCL app is configured, you're ready to start development!

## Start App in Development Mode

Open three terminal windows/tabs and navigate to the top-level directory of the project.

In the first window, use `npm run dev:server` to initialize the server in dev mode.

In the second window, use `npm run dev:client` to initialize the client in dev mode.

In the third window, use `npm run dev:canvas` to initialize a Canvas launch simulator.

Follow instructions in the third window. Logs from the server will appear in the first window and logs from the client will appear in the browser console.

## Check LTI/Auth Status and Get Launch Info

To check the user's current status, use CACCL's `getStatus` function to get a status object.

If the user has not launched via LTI, the status object will take the form:

```ts
{
  launched: false,
}
```

If the user has launched via LTI, the status object will take the form:

```ts
{
  launched: true,
  launchInfo: LaunchInfo,
  authorized: boolean,
}
```

Where `authorized` is true if the user is authorized to access the Canvas API and `launchInfo` contains all LTI launch info. See the [LaunchInfo docs](https://github.com/harvard-edtech/caccl-lti/blob/main/docs/LaunchInfo.md) for detailed information on all the properties in the `launchInfo` object.

### On the server:

Import `getStatus`:

```ts
import { getStatus } from 'caccl/server';
```

From within a route, call `getStatus` with the express `req` instance:

```ts
const status = await getStatus(req);
```

### On the client:

Import `getStatus`:

```ts
import { getStatus } from 'caccl/client';
```

From anywhere in the client, call `getStatus`:

```ts
const status = await getStatus();
```

## Access Canvas API

First, make sure the user is authorized to access the Canvas API. See the section above to check if `status.authorized` is `true`. If the user is not authorized, consider setting`lti.authorizeAfterLaunch` to `true` so users are automatically authorized when they launch. Otherwise, you can [manually trigger the authorization process](https://harvard-edtech.github.io/caccl/#trigger-authorization-process).

### On the server:

Import `getAPI`:

```ts
import { getAPI } from 'caccl/server';
```

From within a route, call `getAPI` with the express `req` instance to get an instance of the api:

```ts
const api = await getAPI({
  req,
});
```

Use `api` to interact with the Canvas API. Check out the [CACCL API Docs](https://harvard-edtech.github.io/caccl-api/) for more info on all the powerful CACCL API functions that make it super easy to work with the Canvas API. Note: the default value for `courseId` will be the id of the course that the user launched from. Example:

```ts
const students = await api.course.listStudents();
```

### On the client

Import `getAPI`:

```ts
import { getAPI } from 'caccl/client';
```

Anywhere on the client, call `getAPI` to get an instance of the api:

```ts
const api = await getAPI();
```

Use `api` to interact with the Canvas API. Check out the [CACCL API Docs](https://harvard-edtech.github.io/caccl-api/) for more info on all the powerful CACCL API functions that make it super easy to work with the Canvas API. Note: the default value for `courseId` will be the id of the course that the user launched from. Example:

```ts
const students = await api.course.listStudents();
```

### More options:

If you want to set a default number of times that requests are retried, include `numRetries` (if excluded, `numRetries` is 3):

```ts
// Server
const api = await getAPI({
  res,
  numRetries: 5,
});

// Client
const api = await getAPI({
  numRetries: 5,
});
```

If you want to set a default number of items per page, include `itemsPerPage` (if excluded, `itemsPerPage` is 100):

```ts
// Server
const api = await getAPI({
  res,
  itemsPerPage: 50,
});

// Client
const api = await getAPI({
  itemsPerPage: 50,
});
```

You can mix and match all of these additional options.

## Trigger Authorization Process

If you set `lti.authorizeAfterLaunch` to `true`, your user should be authorized for Canvas API access as soon as they launch via LTI, so this section will probably be irrelevant to you.

If you don't always want users to be authorized for Canvas API access (maybe they only need it for advanced features, for example), you can leave out the `lti.authorizeAfterLaunch` flag and manually redirect the user to the authorization process whenever you need API access.

### On the server:

Import `getStatus`:

```ts
import { redirectToAuth } from 'caccl/server';
```

From within a route, call `redirectToAuth` with the express `req` instance:

```ts
redirectToAuth(res);
```

### On the client:

Import `redirectToAuth`:

```ts
import { redirectToAuth } from 'caccl/client';
```

From anywhere in the client, call `redirectToAuth`:

```ts
redirectToAuth();
```

## Trigger a Self Launch

If your users launch your app via Canvas, you don't need to [enable self launches](https://harvard-edtech.github.io/caccl/#enable-self-launch) and you can skip this section.

If you [enabled self launch](https://harvard-edtech.github.io/caccl/#enable-self-launch), you can trigger a self-launch which redirects the user through Canvas for an LTI launch. This is useful if the user starts in your app instead of starting in Canvas.

### On the server:

Import `redirectToSelfLaunch`:

```ts
import { redirectToSelfLaunch } from 'caccl/server';
```

From within a route, call `redirectToSelfLaunch`:

```ts
redirectToSelfLaunch({
  res,
  courseId: 123875,
});
```

### On the client:

Import `redirectToSelfLaunch`:

```ts
import { redirectToSelfLaunch } from 'caccl/client';
```

From anywhere on the client, call `redirectToSelfLaunch`:

```ts
redirectToSelfLaunch({
  courseId: 123875,
});
```

### More options

If the Canvas hostname is not the default self-launch value, you can manually include it as `canvasHost`:

```ts
// Server
redirectToSelfLaunch({
  res,
  courseId: 123875,
  canvasHost: 'canvas.harvard.edu',
});

// Client
redirectToSelfLaunch({
  courseId: 123875,
  canvasHost: 'canvas.harvard.edu',
});
```

If you already know the appId and you don't want CACCL to look up the appId using the maps and/or admin access token, you can include the id as `appId`:

```ts
// Server
redirectToSelfLaunch({
  res,
  courseId: 123875,
  appId: 58394,
});

// Client
redirectToSelfLaunch({
  courseId: 123875,
  appId: 58394,
});
```

If you'd like to store some state in the `launchInfo` object (helpful for resuming tasks or otherwise supporting continuity), you can include the state as a JSONifiable object as `selfLaunchState`. After the self-launch, you'll find this state in `launchInfo.selfLaunchState`.

```ts
// Server
redirectToSelfLaunch({
  res,
  courseId: 123875,
  selfLaunchState: {
    nextPage: '/discussions',
  },
});

// Client
redirectToSelfLaunch({
  courseId: 123875,
  selfLaunchState: {
    nextPage: '/discussions',
  },
});
```

You can mix and match all of these additional options.

## Send Grade Passback

If your app is a custom assignment and it finishes by passing grades back to Canvas, you can use CACCL's `handlePassback` function to send feedback/points/etc. to Canvas.

### On the server:

Import `handlePassback`:

```ts
import { handlePassback } from 'caccl/server';
```

From within a route, call `handlePassback` with the express `req` instance:

```ts
// Text submission
handlePassback({
  req,
  text: 'Text of the submission',
});

// URL submission
handlePassback({
  req,
  url: 'https://url.of/the/submission',
});
```

To add a grade, either include `score` (raw point value) or `percent` (percent of total allowed points):

```ts
// Include score
handlePassback({
  req,
  ...
  score: 24,
});

// Include percent
handlePassback({
  req,
  ...
  percent: 97,
});
```

To overwrite the submission timestamp (defaults to now), include either a string (ISO 8601) or JS Date instance as `submittedAt`:

```ts
handlePassback({
  req,
  ...
  submittedAt: subDateObj,
});
```

### On the client:

Import `handlePassback`:

```ts
import { handlePassback } from 'caccl/client';
```

From anywhere on the client, call `handlePassback`:

```ts
// Text submission
handlePassback({
  text: 'Text of the submission',
});

// URL submission
handlePassback({
  url: 'https://url.of/the/submission',
});
```

To add a grade, either include `score` (raw point value) or `percent` (percent of total allowed points):

```ts
// Include score
handlePassback({
  ...
  score: 24,
});

// Include percent
handlePassback({
  ...
  percent: 97,
});
```

To overwrite the submission timestamp (defaults to now), include either a string (ISO 8601) or JS Date instance as `submittedAt`:

```ts
handlePassback({
  ...
  submittedAt: subDateObj,
});
```

## Send Other Requests

You're welcome to use another request sender, but if you use ours, it'll provide more consistency and will ensure your requests work with the development environment.

### On the server:

Import `sendRequest`:

```ts
import { sendRequest } from 'caccl/server';
```

See below on how to use sendRequest.

### On the client:

Import `sendRequest`:

```ts
import { sendRequest } from 'caccl/client';
```

See below on how to use sendRequest.

### Using sendRequest

To send requests, simply call `sendRequest` with the `path` of the endpoint:

```ts
const response = await sendRequest({
  path: '/api/boards',
});
```

The **response** is an object of the form `{ body, status, headers }` where `body` is the JSON data returned from the endpoint, `status` is the http status code, and `headers` is a map of headers in the response.

If the hostname is not the same as the current server, include it as `host`:

```ts
const response = await sendRequest({
  path: '/api/boards',
  host: 'another.host.com',
});
```

If the method is not `GET`, you can include it as `method`:

```ts
const response = await sendRequest({
  path: '/api/boards',
  method: 'POST',
});
```

Independent of the method of request, you can include an object containing parameters. These are sent as either the body or query (depending on the method) and each value is stringified. If you need to send a JSON object as a parameter value, `JSON.stringify` it and then `JSON.parse` it on the other end. Include parameters as `params`:

```ts
const response = await sendRequest({
  path: '/api/boards',
  method: 'POST',
  params: {
    title: 'My Board',
    position: 10,
  },
});
```

There are also a few advanced options:

- Include `headers`, a map `{ name => value }` of headers to include with the request
- Include `numRetries` to allow the request sender to retry the request this number of times

# Deploying Your App

## Get Credentials

Installation credentials are created by you. We recommend using a powerful random string generator to generate consumer secrets, and we recommend using a combination of random text and descriptive text for consumer keys. Example:

```ts
consumerKey = 'clientname-248915tjds8f';
consumerSecret = 'fja8web7g9a9s8mue8t2b-3t7n-98asdn7f8v6as5dv76fb8a67sdtfsd-gne8g';
```

You can either pass these values into the initializer function on the server, or you can add them as environment variables (`CONSUMER_KEY` and `CONSUMER_SECRET`).

Developer credentials are created by whoever manages the Canvas instance that you're trying to integrate with. For example, if the instance for a university, try reaching out to their central IT department or Canvas admin team. If you are a 3rd party company, be prepared for your client to require a contract and security review at this point. Once you reach the appropriate person, ask them to generate a new "Developer Key" for your app, following the [How do I add a developer key for an account?](https://community.canvaslms.com/docs/DOC-12657-4214441833) instructions. Note: your `Redirect URI` should be `https://<AppHostName>/canvas/launch`.

## Build Your App

To build your app, simply run `npm run build` from the top-level directory of the app. You might want to run `npm install` before building, just to make sure all dependencies are all installed.

## Start Your App

Once your app is built, simply run `npm run start` from the top-level directory of the app.

## Install Your App

To install your app into a course, you'll need to create an LTI v1.1 (LTI v1.3 coming soon) configuration cartridge (XML). There are great tools online for building these XML files. Try googling "LTI XML Generator" or just use the [edu-apps xml generator](https://www.edu-apps.org/build_xml.html). Set the launch URL as `https://<AppHostName>/canvas/launch`.

Once you have the cartridge, install your LTI app using these steps:

1. Open the Canvas course or account that you'd like to install the app into
1. Click "Settings" in the left-hand navigation menu
1. Switch to the "Apps" tab
1. Click "View App Configurations"
1. Click "+ App"
1. Set "Configuration Type" to "Paste XML"
1. Add an appropriate App Name
1. Set "Consumer Key" to one of your consumer keys
1. Set "Shared Secret" to the associated consumer secret
1. Paste your cartridge in the "XML Configuration" box
1. Click "Submit"

Note: it's convenient to upload this XML cartridge to your app's server. Then, you can use the "By URL" configuration type and just paste the URL instead of the full XML contents.

# Advanced Setup

### Use Custom Express App

By default, CACCL sets up an express server for you. However, if you want more control, you have two options:

#### Customize CACCL's Express App

Either include an `express` configuration object when initializing CACCL or use environment variables to customize. All parameters are optional: you can include any params and exclude any params as well. You can also mix and match between parameters and environment variables.

| Description | Config Param | Environment Variable | Default |
| :--- | :--- | :--- | :--- |
| Port to listen to | port | PORT | 8080 |
| Session secret | sessionSecret | SESSION_SECRET | random |
| Cookie name | cookieName | COOKIE_NAME | random |
| Session duration (min) | sessionMins | SESSION_MINS | 360 |

Example:

```ts
initCACCL({
  express: {
    cookieName: 'My App',
    sessionDuration: 60,
  },
});
```

You can also include a custom [express-session](https://www.npmjs.com/package/express-session) store as `express.sessionStore`. By default, we use a non-leaking memory store.

Finally, if there are any operations you'd like to perform on the express app after it is set up but before CACCL adds any routes to it, include an `express.preprocessor` function.

#### Provide Your Own Express App

If you'd like complete control over the express app configuration, create your own express app, make sure you add support for an [express-session](https://www.npmjs.com/package/express-session), and include it as `express.app`.

```ts
initCACCL({
  express: {
    app: myCustomApp,
  },
});
```

### Store User API Tokens in a Database

By default, when a user authorizes your app for API access, that authorization (packet containing token, expiration, refresh token) will be stored in memory. When your app is restarted or the memory is cleared, or when the user switches between multiple servers, their authorization will no longer be available and they will need to reauthorize the app.

To store API authorization longer term, provide CACCL with a token store initialization function that, when called, creates a token store. Include it when calling `initCACCL` on the server: `api.initTokenStore`. The initTokenStore function must implement our [CACCLStore Initialization Function](https://github.com/harvard-edtech/caccl-memory-store/blob/main/lib/InitCACCLStore.d.ts) interface, which is a function that returns a [CACCLStore](https://github.com/harvard-edtech/caccl-memory-store/blob/main/lib/CACCLStore.d.ts) instance.

Examples of such usage: create an `initTokenStore` function that returns a CACCLStore instance where `get` reads from a db and `set` writes to a db.

### Access API via Predefined Access Token

Although we recommend using CACCL's oauth exchange process to authorize the user and then access the Canvas API on their behalf, sometimes you may already have an access token that is predefined. If this is the case, you can create your own instance of the CACCL API:

```ts
import initAPI from 'caccl-api';

const api = initAPI({
  canvasHost: 'canvas.harvard.edu',
  accessToken: '1234~fdjabv9w8efnlaijspo8egbaiushefw2etghkj',
});
```

You can also include advanced API configuration defaults:

| Description | Config Param | Default |
| :--- | :--- | :--- |
| Number of times to retry failed requests | numRetries | 3 |
| Default number of items to request per page | itemsPerPage | 100 |
| Default courseId to use for requests | defaultCourseId | none |

Example:

```ts
const api = initAPI({
  canvasHost: 'canvas.harvard.edu',
  accessToken: '1234~fdjabv9w8efnlaijspo8egbaiushefw2etghkj',
  numRetries: 5,
});
```

Use `api` to interact with the Canvas API. Check out the [CACCL API Docs](https://harvard-edtech.github.io/caccl-api/) for more info on all the powerful CACCL API functions that make it super easy to work with the Canvas API. Example:

```ts
const students = await api.course.listStudents();
```

### Enable Self Launch

Usually, LTI apps are launched by users who start in Canvas. However, if you'd like your app to be able to launch itself, CACCL has a clever self-launch process that allows your app to launch itself, given information about the Canvas instance and course. To enable this feature, add an `lti.selfLaunch` configuration object. CACCL needs to know the appId (also referred to as the external tool id) of your app as it is installed in the course that you'd like to self-launch from. There are many ways you can share appIds with CACCL:

If an appId is used across an entire Canvas instance (there is only one appId for that Canvas instance), include it in the `lti.selfLaunch.hostAppIdMap` map `{ canvasHost => appId }`:

```ts
initCACCL({
  lti: {
    selfLaunch: {
      hostAppIdMap: {
        'canvas.harvard.edu': 18934,
      },
    },
  },
});
```

If an appId is used in a specific course in a Canvas instance, include it in the `lti.selfLaunch.courseAppIdMap` map `{ canvasHost => courseId => appId }`:

```ts
initCACCL({
  lti: {
    selfLaunch: {
      courseAppIdMap: {
        'canvas.harvard.edu': {
          124892: 84290,
          124899: 92848,
        },
      },
    },
  },
});
```

If an appId is not known ahead of time, you can include Canvas admin access token(s) so your app can look up appIds on the fly. Include the tokens in the `lti.selfLaunch.adminAccessTokenMap` map `{ canvasHost => accessToken[] }`:

```ts
initCACCL({
  lti: {
    selfLaunch: {
      adminAccessTokenMap: {
        'canvas.harvard.edu': [
          '1423~jf8tu0jalsjdf0jgh8ha9w8uefljasdf8jrga',
          '1423~f8g09jgha9shd31hg9hha89qwrpmzhdb8398h',
        ],
      },
    },
  },
});
```

If you include `lti.selfLaunch.adminAccessTokenMap`, CACCL will cache appIds in a store that implements our [CACCLStore](https://github.com/harvard-edtech/caccl-memory-store/blob/main/lib/CACCLStore.d.ts) interface. We default to a memory-based token store, but you can provide your own store by including an `lti.selfLaunch.initAppIdStore` function that implement our [CACCLStore Initialization Function](https://github.com/harvard-edtech/caccl-memory-store/blob/main/lib/InitCACCLStore.d.ts) interface, which is a function that returns a [CACCLStore](https://github.com/harvard-edtech/caccl-memory-store/blob/main/lib/CACCLStore.d.ts) instance. Pro tip: create your own custom store and pre-populate it with appIds (store keys take the form `${canvasHost}/${courseId}` and values are appIds).

```ts
initCACCL({
  lti: {
    selfLaunch: {
      initAppIdStore: initMyMongoBasedStore,
    },
  },
});
```

If you have other runtime logic that determines the appropriate appId, you can also provide the appId when triggering a self-launch.

Finally, when performing a self-launch, you'll need both a `courseId` and `canvasHost`. If there's a `canvasHost` that you use more often, you can include an `lti.selfLaunch.defaultCanvasHost` so you don't have to include the `canvasHost` if self-launching via that `defaultCanvasHost`.

```ts
initCACCL({
  lti: {
    selfLaunch: {
      defaultCanvasHost: 'canvas.harvard.edu',
    },
  },
});
```

### Manual Setup

If you'd like to set up your own project from scratch, or if you'd like to integrate CACCL with an existing app:

1. Add `caccl` to your server and client with `npm install --save caccl`
1. On your server, initialize CACCL:

```ts
import initCACCL from 'caccl/server';

await initCACCL({
  ...
});
```

Then, you can follow other instructions on configuring CACCL on the server (see sections above).