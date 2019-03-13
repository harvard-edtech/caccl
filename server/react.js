// A special setup of the server that corresponds to a react-environment
// with the react app in the client/ folder

const path = require('path');
const express = require('express');

const initCACCL = require('.');

/* eslint no-console: "off" */

/**
 * Initializes the CACCL library
 * @author Gabriel Abrams
 * APP:
 * @param {object} [app=generate new express app] - the express app to use and
 *   add middleware to. If excluded, we generate a new express app (see
 *   sessionSecret, cookieName, sessionMins, onListenSuccess, onListenFail,
 *   sslKey, sslCertificate, sslCA)
 * @param {number} [port=proces.env.PORT || 443] - the port to listen on.
 *   Only valid if app is excluded
 * @param {string} [sessionSecret=randomly generated string] - the session
 *   secret to use when encrypting sessions. Only valid if app is excluded
 * @param {string} [cookieName=CACCL-based-app-session-<timestamp>-<random str>]
 *   - the cookie name to send to client's browser. Only valid if app is
 *   excluded
 * @param {number} [sessionMins=360 (6 hours)] - number of minutes the session
 *   should last for. Only valid if app is excluded
 * @param {function} [onListenSuccess=console log] - called when server is
 *   successfully listening for requests. Only valid if app is excluded
 * @param {function} [onListeningFail=console log] - called if server fails
 *   to start listening for requests. Argument: error. Only valid if app is
 *   excluded
 * @param {string} [sslKey] - ssl key to use to secure the connection. Only
 *   valid if both sslKey and sslCertificate are included. Only valid if app is
 *   excluded. If value is a filename, that file is read and parsed.
 * @param {string} [sslCertificate] - ssl certificate  to use to secure the
 *   connection. Only valid if both sslKey and sslCertificate are included. Only
 *   valid if app is excluded. If value is a filename, that file is read and
 *   parsed
 * @param {string} [clientOrigin] - the origin of the client (to allow CORS),
 *   not required if the client is served on the same origin
 * @param {string|array.<string>} [sslCA] - certificate chain linking a
 *   certificate authority to our ssl certificate. If string, certificates will
 *   be automatically split. Only valid if app is excluded
 *
 * API:
 * @param {boolean} [disableServerSideAPI] - if false, automatically adds
 *   req.api to routes encapsulated by routesWithAPI
 * @param {array.<string>} [routesWithAPI=['*']] - the list of routes where the
 *   api should be added to as req.api. Only valid if disableServerSideAPI is
 *   false
 * @param {string} [accessToken] - a default access token to apply to all
 *   requests
 * @param {string} [canvasHost=canvas.instructure.com] - a default canvas host
 *   to use for all requests
 * @param {boolean} [dontUseLaunchCanvasHost] - if truthy, requests are sent to
 *   the Canvas host that the current user launched from (if available via
 *   the session)
 * @param {string} [cacheType=none] - If 'memory', cache is stored in
 *   memory. If 'session', cache is stored in express the session. To include a
 *   custom cache, include it as cache
 * @param {object} [cache] - Custom cache manager instance. Not
 *   required if using 'memory' or 'session' cacheType (those caches are
 *   built-in)
 * @param {function} [sendRequest] - Function that sends a request to
 *   the Canvas API. Defaults to axios-based request sender (which we recommend)
 * @param {number} [defaultNumRetries] - Number of times to retry a
 *   request
 * @param {number} [itemsPerPage] - Number of items to request
 *   on a get request
 *
 * AUTHORIZATION:
 * @param {boolean} [disableAuthorization] - if falsy, sets up automatic
 *   authorization when the user visits authorizePath
 * @param {object} [developerCredentials] - canvas app developer credentials in
 *   the form { client_id, client_secret }. Required if authorization is enabled
 * @param {string} [defaultAuthorizedRedirect='/'] - the
 *   default route to visit after authorization is complete (you can override
 *   this value for a specific authorization call by including query.next or
 *   body.next, a path/url to visit after completion)
 * @param {object|null} [tokenStore=memory token store] - null to turn off
 *   storage of refresh tokens, exclude to use memory token store,
 *   or include a custom token store of form { get(key), set(key, val) } where
 *   both functions return promises
 * @param {boolean} [simulateLaunchOnAuthorize] - if truthy, simulates an LTI
 *   launch upon successful authorization (if the user hasn't already launched
 *   via LTI), essentially allowing users to either launch via LTI or launch
 *   the tool by visiting launchPath (GET). If falsy, when a user visits
 *   launchPath and has not launched via LTI, they will be given an error. Not
 *   valid if authorization, lti, or server-side API is disabled
 *
 * API Forwarding:
 * @param {boolean} [disableClientSideAPI] - if falsy, adds add api forwarding
 *   (see apiForwardPathPrefix)
 * @param {string} [apiForwardPathPrefix=/canvas] - API forwarding path prefix
 *   to add to all forwarded api requests. This is the
 *   prefix we use to listen for forwarded requests (ex: /canvas/api/v1/courses)
 *
 * LTI:
 * @param {boolean} [disableLTI] - if falsy, starts listening for LTI launches
 *   at launchPath
 * @param {object} [installationCredentials] - installation consumer credentials
 *   to use to verify LTI launch requests in the form
 *   { consumer_key, consumer_secret}
 * @param {string} [launchPath=/launch] - the path to accept POST launch
 *   requests from Canvas
 * @param {string} [redirectToAfterLaunch=/] - the path to
 *   redirect to after a successful launch
 * @param {object} [nonceStore=memory store] - a nonce store to use for
 *   keeping track of used nonces of form { check } where check is a function:
 *   (nonce, timestamp) => Promise that resolves if valid, rejects if invalid
 * @param {boolean} [disableAuthorizeOnLaunch=false] - if falsy, user is
 *   automatically authorized upon launch. If truthy, type must be 'server' and
 *   either disableClientSideAPI or disableServerSideAPI must be falsy
 */
module.exports = (config = {}) => {
  const newConfig = config;
  newConfig.port = (
    newConfig.port
    || process.env.PORT
    || 443
  );

  // Detect development environment
  const thisIsDevEnvironment = (
    process.env.DEV
    || process.env.NODE_ENV === 'development'
  );

  // Determine initial working directory
  const initialWorkingDirectory = process.env.INIT_CWD;

  // Change config for dev environment
  if (thisIsDevEnvironment) {
    console.log('\nRunning as a development server:');
    console.log('- React servers on localhost:3000 will be allowed to connect to this server');

    // Add fake developer credentials (so authentication is possible via
    //   canvas-partial-simulator)
    console.log('- Developer credentials will be overwritten to work with our Canvas simulator');
    newConfig.developerCredentials = {
      client_id: 'client_id',
      client_secret: 'client_secret',
    };

    // Add fake installation credentials (so launches are possible via
    //   canvs-partial-simulator)
    console.log('- Installations credentials will be overwritten to work with our Canvas simulator');
    if (!newConfig.installationCredentials) {
      newConfig.installationCredentials = {
        consumer_key: 'consumer_key',
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
