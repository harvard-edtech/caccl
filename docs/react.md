# Quickstart: React + Express

It just takes a few steps to get your React app connected with Canvas using CACCL.

> Prerequisites:  
> • npm (see [this page](https://www.npmjs.com/get-npm) for help)  
> • git (see [this page](https://gist.github.com/derhuerst/1b15ff4652a867391f03) for help)  


## Step 1: Create a project

After creating a new repo for your project, clone it to your machine:

```bash
git clone https://githost.com/username/my-project
cd my-project
```

Initialize the npm project and follow instructions:

```bash
npm init
```

_Note:_ If not familiar with the `npm init` command, here are our recommended values:

> **package name:** _(leave as is: just press enter)_  
> **version:** _(leave as is: just press enter)_  
> **description:** _one sentence describing your project_  
> **git repository:** _(leave as is: just press enter)_  
> **keywords:** _comma, separated, keywords, describing, your, project_  
> **author:** _Your Name_  
> **license:** _MIT_

Add a `.gitignore` file:

```bash
touch .gitignore
```

...with the following contents:


```bash
# Ignore node modules
node_modules/

# Ignore configuration files
config/
```

## Step 2: Initialize React

Run in the root directory of your project:

```bash
npx create-react-app client
```

## Step 3: Install CACCL

Run in the root directory of your project:

```bash
npm install --save caccl
cd client
npm install --save caccl
```

## Step 4: Add more scripts to your root package.json

In the root directory of your project (`package.json`, not `client/package.json`):

```json
{
    "scripts": {
      "start": "node index.js",
      "build": "cd ./client;npm run build",
      "dev:canvas": "node ./node_modules/caccl/canvas/startPartialSimulation",
      "dev:server": "export DEV=true;npm start",
      "dev:client": "export DEV=true;cd client;npm start"
    }
}
```

## Step 5: Create config files

Create a new `config/` folder:

```bash
mkdir config
```

Create three new config files:

```js
// config/developerCredentials.js
module.exports = {
  client_id: 'client_id',
  client_secret: 'client_secret',
};
```

```js
// config/installationCredentials.js
module.exports = {
  consumer_key: 'consumer_key',
  consumer_secret: 'consumer_secret',
};
```

```js
// config/canvasDefaults.js
module.exports = {
  canvasHost: /* your Canvas host (e.g., canvas.harvard.edu) */,
};
```

On the production server, you'll want to add the actual developer and installation credentials to these configuaration files.

## Step 6: Set up the server

Create an `index.js` file in the root directory of your project:

```bash
touch index.js
```

Set its contents to the following:

```js
const initCACCL = require('caccl/server/react');

const developerCredentials = require('./config/developerCredentials');
const installationCredentials = require('./config/installationCredentials');
const canvasDefaults = require('./config/canvasDefaults');

const app = initCACCL({
  developerCredentials,
  installationCredentials,
  canvasHost: canvasDefaults.canvasHost,
});
```

**More:** for more info on setting up the server, see [instructions for using CACCL on the server](https://github.com/harvard-edtech/caccl/blob/master/docs/server.md).

# Connecting a React Component to Canvas

In any React component that needs to access Canvas, add the following:

```js
import initCACCL from 'caccl/client/cached';

const api = initCACCL();
```

# Starting the Environment:

#### Production:

Run from the root directory of the project:

1. Build using `npm run build`
2. Start the app using `npm start`

If you see an `EACCES` error, you probably need to run `sudo npm start` instead.

#### Development:

##### Set up the development environment:

Add simulated Canvas environment info:

1. Create a `config/devEnvironment.js` file
2. Store the following contents:

```js
module.exports = {
  canvasHost: /* an actual Canvas instance */,
  courseId: /* an actual test course in that instance */,
  accessToken: /* token for a user that has access to that course */,
};
```

##### Don't have an access token or test course?

1. Get a test course

  - If your school has a Canvas instance (canvas.harvard.edu, for example), use that as your Canvas host. You'll also need your own sandbox course. Contact your school's Canvas admin department or IT. Use `canvas.harvard.edu` as your `canvasHost` during set up (above) in `config/devEnvironment.js`.

  - If you don't have a Canvas instance, visit [canvas.instructure.com](canvas.instructure.com), create an instructor account and create your own test course. Use `canvas.instructure.com` as your `canvasHost` during set up (above) in `config/devEnvironment.js`.

  To find your test course's courseId, visit it in your browser and extract the numerical id directly from the url:  
  http://canvas.harvard.edu/courses/**courseId**

2. Get an access token

  **Note:** We recommend that you create a "fake" user, add them to your test course, and perform the following steps as that fake user. Your personal access token might have higher privileges than a typical user in the course, so using your personal access token allows your app to accidentally do more damage. Using a "fake" user limits this potential damage.

  a. Visit your Canvas instance and log in. 

  b. Click the user picture (top left of the screen).

  c. Click "Settings"

  d. Scroll down and click "+ New Access Token"

  e. Set the purpose to: "Dev Environment for <App Name>"

  f. Leave the expiry blank (or set an expiry but remember to go through this process again once the token expires)

  g. Click "Generate Token"

  h. Save the new token in a secure location. Use this token during set up (above) in `config/devEnvironment.js`.

##### Starting the development environment:

To start the development environment, from the root directory of your project, run each of the following commands in three different terminal windows:

- `npm run dev:canvas` _starts a simulated Canvas instance_
- `npm run dev:server` _starts the server_
- `npm run dev:client` _starts the React development environment_

To launch your app, see the first terminal window (canvas) for instructions.