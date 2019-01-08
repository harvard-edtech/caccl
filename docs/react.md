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

Add a `.gitignore` file:

```bash
echo "# Ignore node modules"
echo "node_modules/" >> .gitignore
echo "# Ignore secret configuration files"
echo "config/" >> .gitignore
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

## Step 4: Add scripts to package.json

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

In the root directory of your project:

```bash
mkdir config
echo "module.exports = {" >> config/developerCredentials.js
echo "  client_id: 'client_id'," >> config/developerCredentials.js
echo "  client_secret: 'client_secret'," >> config/developerCredentials.js
echo "};" >> config/developerCredentials.js
echo "module.exports = {" >> config/installationCredentials.js
echo "  consumer_key: 'consumer_key'," >> config/installationCredentials.js
echo "  consumer_secret: 'consumer_secret'," >> config/installationCredentials.js
echo "};" >> config/installationCredentials.js
```

On the production server, you'll want to add the actual developer and installation credentials to these configuaration files.

## Step 5: Set up the server

Create an `index.js` file in the root directory of your project:

```bash
touch index.js
```

Set its contents to the following:

```js
const initCACCL = require('caccl/server/react');

const developerCredentials = require('./config/developerCredentials');
const installationCredentials = require('./config/installationCredentials');

const app = initCACCL({
  canvasHost: 'canvas.harvard.edu',
  developerCredentials,
  installationCredentials,
});
```

**More:** for more info on setting up the server, see [instructions for using CACCL on the server](https://github.com/harvard-edtech/caccl/blob/master/docs/server.md).

## Step 6: Set up the client

In any React component that needs to access Canvas, add the following:

```js
import initCACCL from 'caccl/client/cached';

const api = initCACCL();
```

# Starting the Environment:


#### Production:

1. Build using `npm build`
2. Start the app using `npm start`

#### Development:

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

To start the development environment, from the root directory of your project, run each of the following commands in three different terminal windows:

- `npm run dev:canvas` _starts a simulated Canvas instance_
- `npm run dev:server` _starts the server_
- `npm run dev:client` _starts the React development environment_

To launch your app, see the first terminal window (canvas) for instructions.