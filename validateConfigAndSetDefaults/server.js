const path = require('path');

const initPrint = require('./helpers/initPrint');
const genExpressApp = require('../genExpressApp');

/**
 * Validates server configuration options and makes changes (sets defaults etc.)
 * @author Gabe Abrams
 * @param {object} oldConfig - the current configuration object
 * @return {object} the new configuration object
 */
module.exports = (oldConfig) => {
  const config = oldConfig;
  const print = initPrint(config.verbose);

  /*------------------------------------------------------------------------*/
  /*                            File-based Config                           */
  /*------------------------------------------------------------------------*/

  // Function that imports a config file
  const launchDirectory = process.env.INIT_CWD;
  const readConfig = (name) => {
    const configPath = path.join(launchDirectory, `config/${name}.js`);
    try {
      return require(configPath); // eslint-disable-line global-require, import/no-dynamic-require, max-len
    } catch (err) {
      // Could not read the config file. Return null to indicate this
      return null;
    }
  };

  // Import config files
  const canvasDefaults = readConfig('canvasDefaults');
  const developerCredentials = readConfig('developerCredentials');
  const installationCredentials = readConfig('installationCredentials');
  const devEnvironment = readConfig('devEnvironment');

  // Add to config object if values aren't already there
  if (canvasDefaults) {
    config.canvasHost = canvasDefaults.canvasHost;
  }
  if (developerCredentials) {
    config.developerCredentials = developerCredentials;
  }
  if (installationCredentials) {
    config.installationCredentials = installationCredentials;
  }
  if (devEnvironment) {
    // Overwrite canvasDefaults with devEnvironment value
    config.canvasHost = devEnvironment.canvasHost;
  }

  /*------------------------------------------------------------------------*/
  /*                                 Scopes                                 */
  /*------------------------------------------------------------------------*/

  if (!config.scopes) {
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      config.scopes = require(path.join(launchDirectory, 'scopes.js'));
    } catch (err) {
      config.scopes = null;
    }
  }

  /*------------------------------------------------------------------------*/
  /*                        Environment-based Config                        */
  /*------------------------------------------------------------------------*/

  // Add developer credentials to config
  const envClientId = (
    process.env.CLIENT_ID
    || process.env.client_id
  );
  const envClientSecret = (
    process.env.CLIENT_SECRET
    || process.env.client_secret
  );
  if (envClientId && envClientSecret) {
    config.developerCredentials = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    };
  }

  // Add installation credentials to config
  const envConsumerKey = (
    process.env.CONSUMER_KEY
    || process.env.consumer_key
  );
  const envConsumerSecret = (
    process.env.CONSUMER_SECRET
    || process.env.consumer_secret
  );
  if (envConsumerKey && envConsumerSecret) {
    config.installationCredentials = {
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
    };
  }

  // Add Canvas host
  const envCanvasHost = (
    process.env.CANVAS_HOST
    || process.env.canvas_host
    || process.env.canvasHost
  );
  if (envCanvasHost) {
    config.canvasHost = envCanvasHost;
  }

  // Add port
  const envPort = (
    process.env.PORT
    || process.env.port
  );
  if (envPort) {
    config.port = envPort;
  }

  /*------------------------------------------------------------------------*/
  /*                               Express App                              */
  /*------------------------------------------------------------------------*/

  // "app" + "sessionSecret" + "cookieName" + "sessionMins"
  let genApp;
  if (config.app) {
    print.variable('app', true, 'we will add any middleware and/or routes to your app');
    if (config.sessionSecret) {
      print.variable('sessionSecret', true, 'this will be ignored: we are not setting up your express app (it was included)');
    }
    if (config.cookieName) {
      print.variable('cookieName', true, 'this will be ignored: we are not setting up your express app (it was included)');
    }
    if (config.sessionMins) {
      print.variable('sessionMins', true, 'this will be ignored: we are not setting up your express app (it was included)');
    }
    // Listeners
    if (config.onListenSuccess) {
      print.variable('onListenSuccess', true, 'this will be ignored: we are not setting up your express app (it was included)');
    }
    if (config.onListenFail) {
      print.variable('onListenFail', true, 'this will be ignored: we are not setting up your express app (it was included)');
    }
  } else {
    // No express app. We are generating one
    print.variable('app', false, 'we\'ll make an express app for you');

    if (config.sessionSecret) {
      print.variable('sessionSecret', true);
    } else {
      print.variable('sessionSecret', false, 'we\'ll create a random one for you');
    }
    if (config.cookieName) {
      print.variable('cookieName', true);
    } else {
      print.variable('cookieName', false, 'we\'ll create a random one for you');
    }
    if (config.sessionMins) {
      print.variable('sessionMins', true);
    } else {
      print.variable('sessionMins', false, 'we\'ll use 6 hours as your session');
    }

    // SSL
    const useSSL = (config.sslKey && config.sslCertificate);
    if (useSSL) {
      print.variable('sslKey', true, 'we will use your ssl key to secure the connection');
      print.variable('sslCertificate', true, 'we will use your ssl certificate to secure the connection');
      if (config.sslCA) {
        print.variable('sslCA', true, 'we will use your certificate authority chain to secure the connection');
      } else {
        print.variable('sslCA', false, 'you did not include a certificate authority chain');
      }
    } else {
      if (config.sslKey) {
        print.variable('sslKey', true, 'this will be ignored: both "sslKey" and "sslCertificate" must be included to enable ssl');
      }
      if (config.sslCertificate) {
        print.variable('sslCertificate', true, 'this will be ignored: both "sslKey" and "sslCertificate" must be included to enable ssl');
      }
      if (config.sslCA) {
        print.variable('sslCA', true, 'this will be ignored: both "sslKey" and "sslCertificate" must be included to enable ssl');
      }
    }

    // Listeners
    if (config.onListenSuccess) {
      print.variable('onListenSuccess', true, 'we will call this function if the server starts up successfuly');
    } else {
      print.variable('onListenSuccess', false, 'we will print a message to the console log when the server starts up successfully');
    }
    if (config.onListenFail) {
      print.variable('onListenFail', true, 'we will call this function if the server fails to start successfuly');
    } else {
      print.variable('onListenFail', false, 'we will print a message and the error to the console log when the server fails to start up successfully');
    }

    // Initialize app after verifying all parameters
    genApp = true;
  }

  /*------------------------------------------------------------------------*/
  /*                                   API                                  */
  /*------------------------------------------------------------------------*/

  // Server-side API
  if (config.disableServerSideAPI) {
    print.boolean('disableServerSideAPI', true, 'server-side api disabled: req.api will not be installed into any routes');
  } else {
    print.boolean('disableServerSideAPI', false, 'server-side api enabled: req.api will be installed into "routesWithAPI" routes');
  }

  // accessToken + canvasHost
  const apiEnabled = (
    !config.disableServerSideAPI
    || !config.disableClientSideAPI
  );
  if (apiEnabled) {
    if (config.accessToken) {
      print.variable('accessToken', true, 'if the current user is not authorized, we will use this access token');
    } else {
      print.variable('accessToken', false, 'we will always use the current user\'s access token');
    }
    if (config.canvasHost) {
      print.variable('canvasHost', true, 'if we don\'t know which canvas host the current user launched from, we will use this host');
    } else {
      config.canvasHost = 'canvas.instructure.com';
      print.variable('canvasHost', false, 'if we don\'t know which canvas host the current user launched from, we will use "canvas.instructure.com". That said, if the user launched via LTI, we\'ll know which canvas host they launched from');
    }
  } else {
    // API not enabled
    if (config.accessToken) {
      print.variable('accessToken', true, 'this will be ignored: the api is disabled (both disableServerSideAPI and disableClientSideAPI are truthy)');
    } else {
      print.variable('accessToken', false, 'when the user is not authenticated (we have no access token for the current user), we will not add an access token to the request (unauthenticated)');
    }
    if (config.canvasHost) {
      print.variable('canvasHost', true, 'this will be ignored: the api is disabled (both disableServerSideAPI and disableClientSideAPI are truthy)');
    } else {
      print.variable('canvasHost', false, 'this is expected: the api is disabled so we have no need for a canvasHost');
    }
  }

  // dontUseLaunchCanvasHost
  if (apiEnabled && !config.disableLTI) {
    if (config.dontUseLaunchCanvasHost) {
      print.boolean('dontUseLaunchCanvasHost', true, `we won't use the launch host. instead, we'll always use the default canvasHost: "${config.canvasHost}"`);
    } else {
      print.boolean('dontUseLaunchCanvasHost', true, `we'll use the user's launch Canvas host (the Canvas instance they launched from) if possible, otherwise, we'll use "${config.canvasHost}"`);
    }
  } else if (config.dontUseLaunchCanvasHost) {
    print.boolean('dontUseLaunchCanvasHost', true, 'this will be ignored: the api is disabled or lti is disabled');
  } else {
    print.boolean('dontUseLaunchCanvasHost', true, 'this is expected: the api is disabled or lti is disabled');
  }

  // routesWithAPI
  if (config.routesWithAPI) {
    if (!config.disableServerSideAPI) {
      // server-side api enabled
      print.variable('routesWithAPI', true, 'we will automatically add req.api to the included routes. Also, if autorization is enabled, we will auto-refresh the user\'s access token when they visiting these routes (if their access token has expired)');
    } else {
      print.variable('routesWithAPI', true, 'this will be ignored: the server-side api is not enabled, so we have no routes with the api');
    }
  } else if (!config.disableServerSideAPI) {
    // server-side api enabled
    config.routesWithAPI = ['*'];
    print.variable('routesWithAPI', false, 'we will automatically add req.api to all routes. Also, if autorization is enabled, we will auto-refresh the user\'s access token when they visiting these routes (if their access token has expired)');
  } else {
    print.variable('routesWithAPI', false, 'this is expected: the server-side api is disabled so we have no need for routesWithAPI');
  }

  // API Caching
  if (config.cache) {
    // Custom cache
    print.variable('cache', true, 'you are using your own custom cache');
    if (config.cacheType) {
      print.variable('cacheType', true, 'this will be ignored: we are using your custom cache');
    }
  } else if (config.cacheType) {
    print.variable('cacheType', true, 'api caching is on');
    if (config.cacheType === 'memory') {
      print.subtitle('API results will be cached in memory.');
    } else if (config.cacheType === 'session') {
      print.subtitle('API results will be cached in the user\'s session.');
    } else {
      // Invalid cache type
      throw new Error('"cacheType" must be either \'memory\', \'session\', or not included.');
    }
  } else {
    print.variable('cacheType', false, 'caching is off');
    print.variable('cache', false, 'caching is off');
    print.subtitle('if you want to enable caching, set "cacheType" to \'memory\' or \'session\' or include your own cache as "cache"');
  }

  // API sendRequest
  if (config.sendRequest) {
    print.variable('sendRequest', true, 'you are overriding our default sendRequest function');
  } else {
    print.variable('sendRequest', false, 'we\'ll use the default axios-based request sender (recommended)');
  }

  // API defaultNumRetries
  if (config.defaultNumRetries) {
    if (config.disableServerSideAPI) {
      print.variable('defaultNumRetries', true, 'this will be ignored: the server-side api is disabled. If you\'re trying to configure this for the client-side api, you should include this option when configuring the client-side instance of CACCL');
    } else {
      print.variable('defaultNumRetries', true, 'we\'ll retry failed requests as many times as you specified');
    }
  } else if (config.defaultNumRetries === 0) {
    if (config.disableServerSideAPI) {
      print.variable('defaultNumRetries', true, 'this will be ignored: the server-side api is disabled. If you\'re trying to configure this for the client-side api, you should include this option when configuring the client-side instance of CACCL');
    } else {
      print.variable('defaultNumRetries', true, 'we will not retry failed requests (you set "defaultNumRetries" to 0)');
    }
  } else if (config.disableServerSideAPI) {
    print.variable('defaultNumRetries', true, 'this will be ignored: the server-side api is disabled. If you\'re trying to configure this for the client-side api, you should include this option when configuring the client-side instance of CACCL');
  } else {
    // Set defaultNumRetries to 3
    config.defaultNumRetries = 3;
    print.variable('defaultNumRetries', false, `we'll retry failed requests ${config.defaultNumRetries} time(s)`);
  }

  // API itemsPerPage
  if (config.itemsPerPage) {
    if (config.disableServerSideAPI) {
      print.variable('itemsPerPage', true, 'this will be ignored: the server-side api is disabled. If you\'re trying to configure this for the client-side api, you should include this option when configuring the client-side instance of CACCL');
    } else {
      print.variable('itemsPerPage', true, 'we\'ll include this many items per page in GET requests');
    }
  } else if (config.disableServerSideAPI) {
    print.variable('itemsPerPage', true, 'this will be ignored: the server-side api is disabled. If you\'re trying to configure this for the client-side api, you should include this option when configuring the client-side instance of CACCL');
  } else {
    // Set itemsPerPage to 100
    config.itemsPerPage = 100;
    print.variable('itemsPerPage', false, `we'll include ${config.itemsPerPage} item(s) per page in GET requests`);
  }

  /*------------------------------------------------------------------------*/
  /*                   API Forwarding and Client-side API                   */
  /*------------------------------------------------------------------------*/

  // Client-side API
  if (config.disableClientSideAPI) {
    print.boolean('disableClientSideAPI', true, 'client-side api disabled: the server will not forward requests from the client to Canvas');
  } else {
    print.boolean('disableClientSideAPI', false, 'client-side api enabled: the server will forward requests from the client to Canvas');
  }

  // apiForwardPathPrefix (needed for /status so it must be set no matter)
  if (!config.apiForwardPathPrefix) {
    config.apiForwardPathPrefix = '/canvas';
  }

  /*------------------------------------------------------------------------*/
  /*                                   LTI                                  */
  /*------------------------------------------------------------------------*/

  // disableLTI
  if (config.disableLTI) {
    print.variable('disableLTI', true, 'LTI features will be disabled');
  } else {
    print.variable('disableLTI', false, 'LTI features will be enabled: we will accept and parse LTI launches');
  }

  // installationCredentials (add default values)
  if (!config.installationCredentials) {
    config.installationCredentials = {
      consumer_key: 'consumer_key',
      consumer_secret: 'consumer_secret',
    };
  }

  // launchPath
  if (config.launchPath) {
    if (config.disableLTI) {
      print.variable('launchPath', true, 'this will be ignored: we have no need for a launch path when LTI is disabled');
    } else {
      print.variable('launchPath', true, 'we will accept LTI launches at your launch path');
    }
  } else if (config.disableLTI) {
    print.variable('launchPath', false, 'this is expected: we have no need for a launch path when LTI is disabled');
  } else {
    config.launchPath = '/launch';
    print.variable('launchPath', false, `we will accept launches at '${config.launchPath}'`);
  }

  // redirectToAfterLaunch
  if (config.redirectToAfterLaunch) {
    if (config.disableLTI) {
      print.variable('redirectToAfterLaunch', true, 'this will be ignored: we have no need for a redirect path when LTI is disabled');
    } else {
      print.variable('redirectToAfterLaunch', true, 'we will redirect to this path upon a successful LTI launch');
    }
  } else if (config.disableLTI) {
    print.variable('redirectToAfterLaunch', false, 'this is expected: we have no need for a redirect path when LTI is disabled');
  } else {
    config.redirectToAfterLaunch = '/';
    print.variable('redirectToAfterLaunch', false, `we will redirect the user to '${config.redirectToAfterLaunch}' upon a successful LTI launch`);
  }

  // nonceStore
  if (config.nonceStore) {
    if (config.disableLTI) {
      print.variable('nonceStore', true, 'this will be ignored: we have no need for a nonce store if LTI is disabled');
    } else {
      print.variable('nonceStore', true, 'we will use your custom nonce store to keep track of nonces');
    }
  } else if (config.disableLTI) {
    print.variable('nonceStore', false, 'this is expected: we have no need for a nonce store when LTI is disabled');
  } else {
    print.variable('nonceStore', false, 'we will use a memory nonce store');
  }

  // disableAuthorizeOnLaunch
  if (!config.disableAuthorizeOnLaunch) {
    if (!config.disableLTI && !config.disableAuthorization) {
      print.boolean('disableAuthorizeOnLaunch', false, 'we will automatically authorize the user upon an LTI launch');
    } else if (!config.disableLTI && config.disableAuthorization) {
      config.disableAuthorizeOnLaunch = true;
      print.boolean('disableAuthorizeOnLaunch', false, 'this will actually be set to "true" because authorization is turned off');
    } else {
      print.boolean('disableAuthorizeOnLaunch', false, 'this will be ignored: we cannot authorize on launch if LTI is disabled');
    }
  } else if (!config.disableLTI && !config.disableAuthorization) {
    print.boolean('disableAuthorizeOnLaunch', true, `users will not be automatically authorized on launch. Do manually authorize a user, direct them to the authorize path: '${config.authorizePath}'`);
  } else {
    print.boolean('disableAuthorizeOnLaunch', true, 'this is expected: we cannot authorize on launch if LTI or authorization are disabled');
  }

  /*------------------------------------------------------------------------*/
  /*                              Authorization                             */
  /*------------------------------------------------------------------------*/

  // disableAuthorization
  if (apiEnabled) {
    // API is enabled. We probably need authorization
    if (config.disableAuthorization) {
      // We don't have authorization. The programmer will need to manually add
      // access tokens
      if (config.accessToken) {
        print.boolean('disableAuthorization', true, 'warning: the api is enabled but authorization is disabled, so the default access token you included ("accessToken") will be used unless you manually authorize users. You can manually authorize a user by adding users\' access tokens to their session: req.accessToken');
      } else {
        print.boolean('disableAuthorization', true, 'warning: the api is enabled but authorization is disabled, so you will need to manually authorize users. You can do this by adding users\' access tokens to req.accessToken');
      }
    } else {
      print.boolean('disableAuthorization', false, 'this is the recommended value: the api is enabled and authorization is enabled so users can be authorized for api access');
    }
  // The API is disabled. We have no need for authorization
  } else if (config.disableAuthorization) {
    print.boolean('disableAuthorization', true, 'this is the recommended value: the api is disabled so we don\'t need authorization enabled unless you plan on manually using users\' access tokens in your own code while not using our CACCL api functionality (access tokens are added as req.accessToken)');
  } else {
    print.boolean('disableAuthorization', false, 'though the api is disabled, authorization is still enabled. This is only useful if you plan on manually using users\' access tokens in your own code while not using our CACCL api functionality (access tokens are added as req.accessToken)');
  }

  // defaultAuthorizedRedirect
  if (config.defaultAuthorizedRedirect) {
    // Redirect included
    if (config.disableAuthorization) {
      // Authorization disabled
      print.boolean('defaultAuthorizedRedirect', true, 'this will be ignored: authorization is disabled so we don\'t need a "defaultAuthorizedRedirect"');
    } else {
      // Authorization enabled
      print.boolean('defaultAuthorizedRedirect', true, 'we will use your redirect path');
    }
  // Redirect not included (use default)
  } else if (config.disableAuthorization) {
    // Authorization disabled
    print.boolean('defaultAuthorizedRedirect', false, 'this is expected: authorization is disabled so we don\'t need a "defaultAuthorizedRedirect"');
  } else {
    // Authorization enabled
    config.defaultAuthorizedRedirect = '/';
    print.boolean('defaultAuthorizedRedirect', false, `we will use '${config.defaultAuthorizedRedirect}' as your "defaultAuthorizedRedirect"`);
  }

  // simulateLaunchOnAuthorize
  if (config.simulateLaunchOnAuthorize) {
    // Redirect included
    if (
      config.disableAuthorization
      || config.disableServerSideAPI
      || config.disableLTI
    ) {
      // Authorization disabled
      print.boolean('simulateLaunchOnAuthorize', true, 'this will be ignored: authorization, server-side api, or lti is disabled so we can\'t simulate a launch upon authorization');
      config.simulateLaunchOnAuthorize = false;
    } else {
      // Authorization enabled
      print.boolean('simulateLaunchOnAuthorize', true, `when a user visits '${config.launchPath}', they will be authorized as usual, but we will also simulate an LTI launch if they haven't already launched via LTI`);
    }
  // Redirect not included (use default)
  } else if (
    config.disableAuthorization
    || config.disableServerSideAPI
    || config.disableLTI
  ) {
    // Authorization disabled
    print.boolean('simulateLaunchOnAuthorize', false, 'this is expected: authorization, server-side api, or lti is disabled so we can\'t simulate a launch upon authorization');
  } else {
    // Authorization enabled
    print.boolean('simulateLaunchOnAuthorize', false, `we will not simulate launches upon authorization. Thus, if a user visits'${config.launchPath}' and the haven't already launched, they will receive an error.`);
  }

  // tokenStore
  if (config.tokenStore) {
    if (config.disableAuthorization) {
      // Not authorizing so the tokenStore is irrelevant
      print.variable('tokenStore', true, 'this will be ignored: authorization is disabled so we have no need for a token store');
    } else {
      print.variable('tokenStore', true, 'we will use your custom token store');
    }
  } else if (config.tokenStore === null) {
    // No token store
    if (config.disableAuthorization) {
      print.variable('tokenStore', false, 'this is expected: no token store is required if authorization is turned off');
    } else {
      print.variable('tokenStore', false, 'we will not store refresh tokens for future sessions, we will only store tokens in the current session. Thus, the user will need to re-authorize every time they launch your app');
    }
  // Using a memory store
  } else if (config.disableAuthorization) {
    print.variable('tokenStore', false, 'this is expected: authorization is disabled so we have no need for a token store');
  } else {
    print.variable('tokenStore', false, 'we will use a memory store for refresh tokens');
  }

  // Developer credentials (add defaults)
  if (!config.developerCredentials) {
    config.developerCredentials = {
      client_id: 'client_id',
      client_secret: 'client_secret',
    };
  }

  // If we need to generate a new express app, do it now that we know the
  // configuration is valid
  if (genApp) {
    config.app = genExpressApp({
      sessionSecret: config.sessionSecret,
      cookieName: config.cookieName,
      sessionMins: config.sessionMins,
      sslKey: config.sslKey,
      sslCertificate: config.sslCertificate,
      sslCA: config.sslCA,
      verbose: config.verbose,
      port: config.port,
    });
  }

  return config;
};
