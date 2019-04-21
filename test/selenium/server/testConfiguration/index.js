const sendRequest = require('caccl-send-request');

// Import caccl libraries
const initCanvasSimulation = require('caccl-canvas-partial-simulator');
const initCACCL = require('../../../../server');

// Import environment
const { accessToken, canvasHost } = require('../../../environment');

// Import tests
const testLaunch = require('./testLaunch');

// Tests a configuration of caccl
module.exports = async (driver, config = {}) => {
  driver.log('Starting test environment');

  // Create a new server
  let app;
  let appErr;
  try {
    const newConfig = config;
    newConfig.canvasHost = 'localhost:8088';
    app = initCACCL(newConfig);
  } catch (err) {
    appErr = err;
  }

  // Ensure that app failed to initialize if no installation credentials
  // and LTI is enabled
  if (!config.disableLTI && !config.installationCredentials) {
    // An error should've occurred
    if (appErr && appErr.message.includes('"installationCredentials" are required when LTI is enabled')) {
      // Correct error!
      return true;
    }
    if (appErr) {
      throw new Error(`LTI was enabled but installationCredentials werent included. An error occurred but not the correct one. Expected an "installationCredentials are required" error but got instead: ${appErr.message}`);
    }
    throw new Error('LTI was enabled but installationCredentials werent included. An error should\'ve occurred.');
  }

  // Ensure that app failed to initialize if no developer credentials
  // and auth is enabled
  if (!config.disableAuthorization && !config.developerCredentials) {
    // An error should've occurred
    if (appErr && appErr.message.includes('"developerCredentials" required')) {
      // Correct error
      return true;
    }
    if (appErr) {
      throw new Error(`Auth was enabled but developerCredentials werent included. An error occurred but not the correct one. Expected an "developerCredentials required" error but got instead: ${appErr.message}`);
    }
    throw new Error('Auth was enabled but developerCredentials werent included. An error should\'ve occurred.');
  }

  // Ensure that the app exists
  if (!app || appErr) {
    throw new Error(`App failed to initialize. An error did ${appErr ? '' : 'not '}occur. ${appErr ? appErr.message : ''}`);
  }

  // Add homepage of app
  app.get('/', (req, res) => {
    res.send('homepage');
  });

  const stopAppServer = async () => {
    return new Promise((resolve) => {
      // Create a route to hit
      app.get('/kill-server-now', (req, res) => {
        res.send('closed');
        req.connection.server.close((err) => {
          return resolve(!err);
        });
      });

      // Hit the route
      sendRequest({
        host: 'localhost',
        path: '/kill-server-now',
        ignoreSSLIssues: true,
      })
        .then(() => {
          return resolve(true);
        })
        .catch(() => {
          return resolve(false);
        });
    });
  };

  // Create a new Canvas simulator
  const canvasServer = initCanvasSimulation({
    accessToken,
    canvasHost,
    dontPrint: true,
  }).server;

  // Keep track of sockets so we can kill them
  const canvasSockets = {};
  let socketKey = 1;
  canvasServer.on('connection', (socket) => {
    // Save new socket
    const key = socketKey;
    socketKey += 1;
    canvasSockets[key] = socket;

    // Remove socket when it closes
    socket.on('close', function () {
      delete canvasSockets[key];
    });

    // Extend socket lifetime for demo purposes
    socket.setTimeout(4000);
  });

  // Function to kill Canvas server and sockets
  const stopCanvasServer = async () => {
    return new Promise((resolve) => {
      // Kill server
      canvasServer.close((err) => {
        return resolve(!err);
      });

      // Kill sockets
      Object.values(canvasSockets).forEach((socket) => {
        socket.destroy();
      });
    });
  };

  // Wait .5s for the services to start
  await new Promise((r) => {
    setTimeout(r, 1000);
  });

  // Run tests
  await testLaunch(driver);

  // Clean up
  driver.log('Killing test environment');
  const appStopped = await stopAppServer();
  const canvasStopped = await stopCanvasServer();
  if (!appStopped || !canvasStopped) {
    driver.log('Either the app or canvas simulator could not be stopped. Now exiting tests.');
    process.exit(1);
  }
};
