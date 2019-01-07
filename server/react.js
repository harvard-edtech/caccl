// A special setup of the server that corresponds to a react-environment
// with the react app in the client/ folder

const fs = require('fs');
const path = require('path');
const express = require('express');

const initCACCL = require('.');

module.exports = (config = {}) => {
  const newConfig = config;
  newConfig.port = newConfig.port || 443;

  // Detect development environment
  const thisIsDevEnvironment = process.env.DEV;
  // > Attempt to read development/test accessToken
  const initialWorkingDirectory = process.env.INIT_CWD;
  let devAccessToken;
  if (thisIsDevEnvironment) {
    const tokenPath = path.join(initialWorkingDirectory, 'devAccessToken.txt');
    try {
      devAccessToken = fs.readFileSync(tokenPath, 'utf-8');
    } catch (err) {
      // Could not read the access token!
      console.log(`Note: could not find a dev access token at ${tokenPath}`);
    }
  }

  // Change config for dev environment
  if (thisIsDevEnvironment) {
    /* eslint no-console: "off" */
    console.log('\nRunning as a development server:');
    if (devAccessToken) {
      console.log('- API requests will be authenticated with the access token in devAccessToken.txt');
      // Use access token as default
      newConfig.accessToken = devAccessToken;
    } else {
      console.log('- API requests will not be authenticated (no dev access token found)');
    }
    console.log('- React servers on localhost:3000 will be allowed to connect to this server');

    // Add fake developer credentials (so authentication is possible via
    //   canvas-partial-simulator)
    console.log('- Developer credentials will be set to: client_id=client_id and client_secret=client_secret');
    newConfig.developerCredentials = {
      client_id: 'client_id',
      client_secret: 'client_secret',
    };

    // Add fake installation credentials (so launches are possible via
    //   canvs-partial-simulator)
    if (!newConfig.installationCredentials) {
      newConfig.installationCredentials = {
        consumer_key: 'consumr_key',
        consumer_secret: 'consumer_secret',
      };
    }

    // Set up CORS for the react client
    newConfig.clientOrigin = 'http://localhost:3000';
  }

  // Initialize CACCL
  const app = initCACCL(newConfig);

  // Serve the front-end
  if (thisIsDevEnvironment) {
    // This is development! Redirect to front-end hosted at localhost:3000
    app.get('/', (req, res) => {
      return res.redirect('http://localhost:3000');
    });
  } else {
    // This is production! Serve the build directory

    // Serve styles, etc
    app.use(express.static(path.join(initialWorkingDirectory, 'client', 'build')));

    // Send frontend
    app.get('/', (req, res) => {
      res.sendFile(path.join(initialWorkingDirectory, 'client', 'build', 'index.html'));
    });
  }

  return app;
};
