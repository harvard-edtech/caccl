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
  let thisIsDevEnvironment;
  let usingSelfSignedCert;
  // > Attempt to read development/test accessToken
  const initialWorkingDirectory = process.env.INIT_CWD;
  let devAccessToken;
  try {
    const tokenPath = path.join(initialWorkingDirectory, 'devAccessToken.txt');
    devAccessToken = fs.readFileSync(tokenPath, 'utf-8');

    // Access token was read! Yes, this is the development environment.
    thisIsDevEnvironment = true;
  } catch (err) {
    // This is not the development environment
    thisIsDevEnvironment = false;
  }

  // Change config for dev environment
  if (thisIsDevEnvironment) {
    /* eslint no-console: "off" */
    console.log('\nRunning as a development server:');
    console.log('- API requests will be authenticated with the access token in devAccessToken.txt');
    console.log('- React servers on localhost:3000 will be allowed to connect to this server\n');

    // Use access token as default
    if (!newConfig.accessToken) {
      newConfig.accessToken = devAccessToken;
    }

    // Add fake developer credentials (authentication won't happen)
    if (!newConfig.developerCredentials) {
      newConfig.developerCredentials = {
        client_id: 'no_id',
        client_secret: 'no_secret',
      };
    }

    // Add fake installation credentials (lti launches won't happen)
    if (!newConfig.installationCredentials) {
      newConfig.installationCredentials = {
        consumer_key: 'no_consumer_key',
        consumer_secret: 'no_consumer_secret',
      };
    }

    // Set up CORS for the react client
    newConfig.clientOrigin = 'http://localhost:3000';

    // Use self-signed certificates by default
    if (!newConfig.sslKey && !newConfig.sslCertificate) {
      newConfig.sslKey = path.join(__dirname, 'self-signed-certs/key.pem');
      newConfig.sslCertificate = path.join(__dirname, 'self-signed-certs/cert.pem');

      usingSelfSignedCert = true;

      console.log('\nNote: we\'re using a self-signed certificate!');
      console.log(`- Please visit https://localhost:${newConfig.port}/verify to make sure the certificate is accepted by your browser`);
    }
  }

  // Initialize CACCL
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

  // Add route for verifying self-signed certificate
  if (usingSelfSignedCert) {
    app.get('/verify', (req, res) => {
      return res.send('Certificate accepted!');
    });
  }
};
