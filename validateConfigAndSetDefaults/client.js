const initPrint = require('./helpers/initPrint');

/**
 * Validates client configuration options and makes changes (sets defaults etc.)
 * @author Gabe Abrams
 * @param {object} oldConfig - the current configuration object
 * @return {object} the new configuration object
 */
module.exports = (oldConfig) => {
  const config = oldConfig;
  const print = initPrint(config.verbose);

  // Client-side API
  if (config.disableClientSideAPI) {
    throw new Error('"disableClientSideAPI" cannot be truthy: CACCL on the client side is primarily an API handler. There\'s no reason to use CACCL if "disableClientSideAPI" is truthy.');
  }

  /*------------------------------------------------------------------------*/
  /*                          Irrelevant Variables                          */
  /*------------------------------------------------------------------------*/

  [
    'app',
    'sessionSecret',
    'cookieName',
    'sessionMins',
    'accessToken',
    'canvasHost',
    'authorizePath',
    'defaultAuthorizedRedirect',
    'tokenStore',
    'developerCredentials',
    'installationCredentials',
    'launchPath',
    'redirectToAfterLaunch',
    'nonceStore',
  ].forEach((name) => {
    if (config[name]) {
      print.variable(name, config[name], 'this will be ignored: it is not relevant on the client. Did you mean to include this in the host config options for CACCL?');
      config[name] = null;
    }
  });

  // Irrelevant booleans
  [
    'disableServerSideAPI',
    'authorizeOnLaunch',
  ].forEach((name) => {
    if (config[name]) {
      print.boolean(name, config[name], 'this will be ignored: it is not relevant on the client');
      config[name] = false;
    }
  });

  /*------------------------------------------------------------------------*/
  /*                                   API                                  */
  /*------------------------------------------------------------------------*/

  // accessToken
  if (config.accessToken) {
    print.variable('accessToken', true, 'warning: it\'s not recommended to include access tokens on the client (security risk)');
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
    if (config.cacheType === 'session') {
      throw new Error('"cacheType" cannot be \'session\' on the client: we don\'t have access to the user\'s session when on the client');
    } else if (config.cacheType === 'memory') {
      print.subtitle('API results will be cached in memory.');
    } else {
      // Invalid cache type
      throw new Error('"cacheType" must be either \'memory\' or not included.');
    }
  } else {
    print.variable('cacheType', false, 'caching is off');
    print.variable('cache', false, 'caching is off');
    print.subtitle('if you want to enable caching, set "cacheType" to \'memory\' or include your own cache as "cache"');
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

  // apiForwardPathPrefix
  if (config.apiForwardPathPrefix) {
    print.variable('apiForwardPathPrefix', true, 'we will use your "apiForwardPathPrefix" when forwarding requests to Canvas via the server. Remember to include the same "apiForwardPathPrefix" in the config for the server-side instance of CACCL');
  } else {
    config.apiForwardPathPrefix = '/canvas';
    print.variable('apiForwardPathPrefix', false, `we will use '${config.apiForwardPathPrefix}' when forwarding requests to Canvas via the server. Remember that the server should have the same "apiForwardPathPrefix": either exclude "apiForwardPathPrefix" from the server-side config for CACCL or set "apiForwardPathPrefix" to '${config.apiForwardPathPrefix}'`);
  }

  return config;
};
