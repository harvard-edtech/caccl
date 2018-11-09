const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const randomstring = require('randomstring');

const initPrint = require('./validateConfigAndSetDefaults/helpers/initPrint.js');

/**
 * Creates a new express app with memory-based session, listening on env PORT or
 *   8080, and with randomized session secret and cookie name.
 * @param {number} [port=env.PORT || 8080] - the port to listen to
 * @param {string} [sessionSecret=randomly generated string] - the session
 *   secret to use when encrypting sessions
 * @param {string} [cookieName=CACCL-based-app-session-<timestamp>-<random str>]
 *   - the cookie name to send to client's browser
 * @param {number} [sessionMins=360 (6 hours)] - number of minutes the session
 *   should last for
 * @param {boolean} [verbose] - if truthy, prints information as it works
 * @author Gabriel Abrams
 * @return {object} express app
 */
module.exports = (config = {}) => {
  const app = express();
  const print = initPrint(config.verbose);
  const port = (
    config.port
    || process.env.PORT
    || 8080
  );

  if (config.verbose) {
    print.subtitle('Creating a new express app:');
    print.subsubtitle(`Will attempt to listen on port: ${port}`);
  }

  // Set up body json parsing
  app.use(bodyParser.json({
    limit: '5mb'
  }));

  // Set up body application/x-www-form-urlencoded parsing
  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '5mb'
  }));

  // Set up session (memory-based)
  // > Create random session secret
  const sessionSecret = config.sessionSecret || randomstring.generate(48);
  if (config.verbose) {
    print.subsubtitle(`Using session secret: ${sessionSecret}`);
  }
  // > Create cookie name
  const cookieName = config.cookieName || `CACCL-based-app-session-${new Date().getTime()}-${randomstring.generate(10)}`;
  if (config.verbose) {
    print.subsubtitle(`Using cookie name: ${cookieName}`);
  }
  // > Set session duration to 6 hours
  const sessionDurationMillis = ((config.sessionMins || 360) * 60000);
  if (config.verbose) {
    print.subsubtitle(`Session duration: ${sessionDurationMillis/60000} minutes`);
  }
  // > Add session
  app.use(session({
    cookie: {
      maxAge: sessionDurationMillis
    },
    resave: true,
    name: cookieName,
    saveUninitialized: false,
    secret: sessionSecret
  }));

  // Start Server
  const useSSL = (config.sslKey && config.sslCertificate);
  if (useSSL) {
    // Use HTTPS

    // Prep certificates
    const key = config.sslKey;
    const cert = config.sslCertificate;
    // Parse CA certificates
    let ca = options.config.sslCA || [];
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
      ca
    }, app);
    server.listen(port, (err) => {
      if (err) {
        if (config.onListenFail) {
          config.onListenFail(err);
        } else {
          console.log(`An error occurred while trying to listen and use SSL on port ${port}:`, err);
        }
      } else {
        if (config.onListenSuccess) {
          config.onListenSuccess();
        } else {
          console.log(`Now listening and using SSL on port ${port}`);
        }
      }
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
      } else {
        if (config.onListenSuccess) {
          config.onListenSuccess();
        } else {
          console.log(`Now listening on port ${port}`);
        }
      }
    });
  }

  return app;
};
