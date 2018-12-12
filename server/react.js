// A special setup of the server that corresponds to a react-environment
// with the react app in the client/ folder

const fs = require('fs');
const path = require('path');
const express = require('express');

const initCACCL = require('.');

module.exports = (config = {}) => {
  // Detect development environment
  let thisIsDevEnvironment;
  let devAccessToken;
  let clientOrigin;
  // > Attempt to read development/test accessToken
  const initialWorkingDirectory = process.env.INIT_CWD;
  try {
    const tokenPath = path.join(initialWorkingDirectory, 'devAccessToken.txt');
    devAccessToken = fs.readFileSync(tokenPath, 'utf-8');

    // Access token was read! Yes, this is the development environment.
    thisIsDevEnvironment = true;
    /* eslint no-console: "off" */
    console.log('\nRunning as a development server:');
    console.log('- API requests will be authenticated with the access token in devAccessToken.txt');
    console.log('- React servers on localhost:3000 will be allowed to connect to this server\n');

    // Set up CORS for the react client
    clientOrigin = 'http://localhost:3000';
  } catch (err) {
    // This is not the development environment
    thisIsDevEnvironment = false;
  }

  // Initialize CACCL
  const newConfig = config;
  if (thisIsDevEnvironment) {
    newConfig.clientOrigin = clientOrigin;
    newConfig.accessToken = devAccessToken;
  }
  newConfig.port = newConfig.port || 443;
  const app = initCACCL(newConfig);

  // If production, serve built client app
  if (!thisIsDevEnvironment) {
    // Serve styles, etc
    app.use(express.static(path.join(initialWorkingDirectory, 'client', 'build')));

    // Send frontend
    app.get('/', (req, res) => {
      res.sendFile(path.join(initialWorkingDirectory, 'client', 'build', 'index.html'));
    });
  }
};
