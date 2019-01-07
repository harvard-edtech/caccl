# Quickstart: React with Express Backend

It just takes a few steps to get your React app connected with Canvas using CACCL.

## Step 1: Create a project

> Prerequisites:  
> • npm (see [this page](https://www.npmjs.com/get-npm) for help)  
> • git (see [this page](https://gist.github.com/derhuerst/1b15ff4652a867391f03) for help)  

After creating a new repo for your project, clone it to your machine:

```bash
git clone https://githost.com/username/my-project
cd my-project
```

Initialize the npm project and follow instructions:

```bash
npm init
```

## Step 2: Create the React client

```bash
# From the root directory of your project:
npx create-react-app client
```

## Step 3: Install CACCL

Add CACCL to both the server and client:

```bash
# From the root directory of your project:
npm i --save caccl
cd client
npm i --save caccl
```

Follow [instructions for using CACCL on the server](https://github.com/harvard-edtech/caccl/blob/master/docs/server.md), but use the following import instead:

```js
const initCACCL = require('caccl/server/react');
```

Follow [instructions for using CACCL on the client](https://github.com/harvard-edtech/caccl/blob/master/docs/client.md).

## Step 4: Add shortcuts to package.json

```json
{
    "scripts": {
      "start": "node index.js",
      "build": "cd ./client;npm run build",
      "dev:server": "export DEV=true;npm start",
      "dev:client": "export DEV=true;cd client;npm start"
    }
}
```

#### Production:

Use `npm start` to start the production server (remember to build first!).

#### Development:

If your app requires API access, create a `devAccessToken.txt` file in the root directory of your project, store a Canvas access token as its contents, and add it to `.gitignore`.

To start the app, open two terminal windows and start the server in one and the client in the other:

```bash
npm run dev:server
npm run dev:client
```
