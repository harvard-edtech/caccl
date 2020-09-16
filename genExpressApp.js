const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const randomstring = require('randomstring');

const initPrint = require('./validateConfigAndSetDefaults/helpers/initPrint');

/* eslint-disable no-console */

/**
 * Creates a new express app with memory-based session, listening on env PORT or
 *   8080, and with randomized session secret and cookie name.
 * @author Gabe Abrams
 * @param {number} [port=process.env.PORT || 443] - the port to listen
 *   to
 * @param {boolean} [forceSSL=port is 443 or sslKey and sslCertificate included]
 *   - if true, SSL is turned on (self signed certificates used if none
 *   included)
 * @param {string} [sessionSecret=randomly generated string] - the session
 *   secret to use when encrypting sessions
 * @param {string} [cookieName=CACCL-based-app-session-<timestamp>-<random str>]
 *   - the cookie name to send to client's browser
 * @param {number} [sessionMins=360 (6 hours)] - number of minutes the session
 *   should last for
 * @param {string} [sslKey] - ssl key to use to secure the connection. Only
 *   valid if both sslKey and sslCertificate are included. If value is a
 *   filename, that file is read and parsed
 * @param {string} [sslCertificate] - ssl certificate  to use to secure the
 *   connection. Only valid if both sslKey and sslCertificate are included. If
 *   value is a filename, that file is read and parsed
 * @param {function} [expressAppPreprocessor] - function to run when the Express
 *   app was just created (before any other operations are done on it). The
 *   function should take one argument (the Express app)
 * @param {boolean} [verbose] - if truthy, prints information as it works
 * @return {object} express app
 */
module.exports = (config = {}) => {
  const app = express();
  const print = initPrint(config.verbose);

  // Run pre-processor
  if (config.expressAppPreprocessor) {
    config.expressAppPreprocessor(app);
  }

  // Determine port
  let port = (
    config.port
    || process.env.PORT
    || 443
  );
  if (typeof port === 'string') {
    const isInteger = /^\d+$/.test(port);
    if (!isInteger) {
      console.log(`We are trying to listen on port "${port}" (not a number!)`);
      console.log('Port must be a number!');
      process.exit(0);
    }
    port = parseInt(port);
  }

  if (config.verbose) {
    print.subtitle('Creating a new express app:');
    print.subsubtitle(`Will attempt to listen on port: ${port}`);
  }

  // Set up body json parsing
  app.use(bodyParser.json({
    limit: '5mb',
  }));

  // Set up body application/x-www-form-urlencoded parsing
  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '5mb',
  }));

  // Set up session (memory-based)
  // > Create random session secret
  const sessionSecret = config.sessionSecret || randomstring.generate(48);
  if (config.verbose) {
    print.subsubtitle(`Using session secret: ${sessionSecret}`);
  }
  // > Create cookie name
  const cookieName = config.cookieName || `CACCL-based-app-session-${Date.now()}-${randomstring.generate(10)}`;
  if (config.verbose) {
    print.subsubtitle(`Using cookie name: ${cookieName}`);
  }
  // > Set session duration to 6 hours
  const sessionDurationMillis = ((config.sessionMins || 360) * 60000);
  if (config.verbose) {
    print.subsubtitle(`Session duration: ${sessionDurationMillis / 60000} minutes`);
  }
  // > Add session
  app.use(session({
    cookie: {
      maxAge: sessionDurationMillis,
    },
    resave: true,
    name: cookieName,
    saveUninitialized: false,
    secret: sessionSecret,
    rolling: true,
  }));

  // Start Server
  const needSSL = (port === 443);
  const useSSL = (
    needSSL
    || (config.sslKey && config.sslCertificate)
    || config.forceSSL
  );

  if (useSSL) {
    // Use HTTPS

    // Use self-signed certificates if needed
    let {
      sslKey,
      sslCertificate,
    } = config;
    let showSelfSignedMessage = () => {};
    if (!sslKey || !sslCertificate) {
      // Use self-signed certificates
      sslKey = path.join(__dirname, 'server/self-signed-certs/key.pem');
      sslCertificate = path.join(__dirname, 'server/self-signed-certs/cert.pem');

      showSelfSignedMessage = () => {
        console.log('\nWarning: we\'re using a self-signed certificate!');
        console.log(`- Visit https://localhost:${port}/verifycert in your browser to accept our cert`);
        console.log('- If this is production, consider adding valid certificates\n');
      };

      // Add route for verifying self-signed certificate
      app.get('/verifycert', (req, res) => {
        return res.send('Certificate accepted!');
      });
    }

    // Read in files if they're not already read in
    let key;
    try {
      key = fs.readFileSync(sslKey, 'utf-8');
    } catch (err) {
      key = sslKey;
    }
    let cert;
    try {
      cert = fs.readFileSync(sslCertificate, 'utf-8');
    } catch (err) {
      cert = sslCertificate;
    }

    // Parse CA certificates
    let ca = config.sslCA || [];
    // If file isn't split already, split it
    if (typeof ca === 'string') {
      // Not split yet
      const caText = ca;
      ca = [];
      let currentCert = [];
      caText.split('\n').forEach((line) => {
        cert.push(line);
        if (line.match(/-END CERTIFICATE-/)) {
          ca.push(currentCert.join('\n'));
          currentCert = [];
        }
      });
    }

    // Start HTTPS server
    const server = https.createServer({
      key,
      cert,
      ca,
    }, app);
    server.on('error', (err) => {
      // An error occurred while attempting to listen
      if (err.code === 'EACCES') {
        console.log(`\n\nError: We have insufficient privileges to listen on port ${port}!`);
        console.log('Choose another port or elevate this app\'s privileges.');
        console.log('');
        console.log('Choosing another port:');
        console.log('- Set the "PORT" environment variable');
        console.log('    OR');
        console.log('- Add a "port" configuration option when calling initCACCL');
        console.log('');
        console.log('Elevating this app\'s privileges:');
        console.log('- Start this app using "sudo" (be careful, please!)');
        process.exit(0);
      }

      if (err.code === 'EADDRINUSE') {
        console.log(`\n\nError: Another service is already using port ${port}!`);
        console.log(`Choose another port or kill the service that's using port ${port}`);
        console.log('');
        console.log('Choosing another port:');
        console.log('- Set the "PORT" environment variable');
        console.log('    OR');
        console.log('- Add a "port" configuration option when calling initCACCL');
        process.exit(0);
      }

      // Unknown error
      if (config.onListenFail) {
        config.onListenFail(err);
      } else {
        console.log(`An error occurred while trying to listen and use SSL on port ${port}:`, err);
        process.exit(0);
      }
    });
    server.listen(port, () => {
      if (config.onListenSuccess) {
        config.onListenSuccess();
      } else {
        console.log(`Now listening and using SSL on port ${port}`);
      }
      showSelfSignedMessage();
    });
  } else {
    // Use HTTP
    const server = http.createServer(app);
    server.listen(port).on('listening', (err) => {
      if (err) {
        if (config.onListenFail) {
          config.onListenFail(err);
        } else {
          console.log(`An error occurred while trying to listen on port ${port}:`, err);
        }
      } else if (config.onListenSuccess) {
        config.onListenSuccess();
      } else {
        console.log(`Now listening on port ${port}`);
      }
    });
  }

  return app;
};
