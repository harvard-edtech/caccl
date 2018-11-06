const print = require('../print.js');

const genExpressApp = require('../genExpressApp.js');

module.exports = (oldConfig) => {
  const config = oldConfig;

  // Express App
  // - If not included, create one
  if (!config.app) {
    // Print helpful message
    if (config.verbose) {
      // No express app. We are generating one
      print.head('You didn\'t include "app". We\'ll make an express app for you.');

      if (config.sessionSecret) {
        print.sub('You included "sessionSecret". We\'ll use this.');
      } else {
        print.sub('You didn\'t include "sessionSecret". We\'ll create a random one for you.');
      }
      if (config.cookieName) {
        print.sub('You included "cookieName". We\'ll use this.');
      } else {
        print.sub('You didn\'t include "cookieName". We\'ll create a random one for you.');
      }
      if (config.sessionMins) {
        print.sub('You included "sessionMins". We\'ll use this.');
      } else {
        print.sub('You didn\'t include "sessionMins". We\'ll use 6 hours as your session lifetime.');
      }
    }

    // Initialize app
    config.app = genExpressApp({
      sessionSecret: config.sessionSecret,
      cookieName: config.cookieName,
      sessionMins: config.sessionMins,
      verbose: config.verbose,
    });
  }

  // API enabling
  const apiEnabled = (
    !config.disableServerSideAPI
    || !config.disableClientSideAPI;
  );
  if (config.verbose) {
    if (config.disableServerSideAPI) {
      print.head('You disabled the server-side api.');
      print.sub('req.api will not be installed into any routes.');
    } else {
      print.head('The server-side api is enabled.');
    }
    if (config.disableClientSideAPI) {
      print.head('You disabled the client-side api.');
      print.sub('The server will not forward requests from the client.');
    }
    if (apiEnabled) {
      print.head('API is enabled.');
      if (config.accessToken) {
        print.sub('A default "accessToken" was provided. If the current user is not authorized, we will use this access token.');
      } else {
        print.sub('No default "accessToken" was provided. We will always use the current user\'s access token.')
      }
      if (config.canvasHost) {
        print.sub('A default "canvasHost" was provided. If we don\'t know which canvas host the current user launched from, we will use this host.');
      } else {
        print.sub('No default "canvasHost" was provided. If we don\'t know which canvas host the current user launched from, we will use "canvas.instructure.com". That said, if the user launched via LTI, we\'ll know which canvas host they launched from.');
      }
    }
  }

  // API Caching
  if (config.cacheType) {
    if (config.verbose) {
      print.head('API caching is on.');
      if (config.cacheType === 'memory') {
        print.sub('API results will be cached in memory.');
      } else if (config.cacheType === 'session') {
        print.sub('API results will be cached in the user\'s session.');
      }
    }
    if (['memory','session'].indexOf(config.cacheType) < 0) {
      // Invalid cache type
      throw new Error('"cacheType" must be either \'memory\', \'session\', or not included.');
    }
  } else if (config.cache) {
    if (
      !config.cache.get
      || !config.cache.set
      || !config.cache.deletePaths
      || !config.cache.getAllPaths
      || !config.cache.deleteAllPaths
    ) {
      throw new Error('Your custom cache needs to have the following functions: get, set, deletePaths, getAllPaths, deleteAllPaths.');
    }
    if (config.verbose) {
      print.head('API caching is on.');
      print.sub('You are using your own custom cache instance.');
    }
  } else {
    if (config.verbose) {
      print.head('API caching is turned off.');
      print.sub('If you want to enable caching, set "cacheType" to \'memory\' or \'session\' or include your own cache as "cache"');
    }
  }

  // API sendRequest
  if (config.verbose) {
    if (config.sendRequest) {
      print.head('You are overriding our default sendRequest function.');
    } else {
      print.head('No "sendRequest" was included. We\'ll use the default axios-based request sender (recommended).');
    }
  }

  // API defaultNumRetries
  if (config.defaultNumRetries) {
    if (config.verbose) {
      print.head('You included "defaultNumRetries". We\'ll retry failed requests this many times.');
    }
  } else {
    // Set defaultNumRetries to 3
    config.defaultNumRetries = 3;
    if (config.verbose) {
      print.head('You didn\'t include "defaultNumRetries". We\'ll retry failed requests 3 times.');
    }
  }

  // API defaultItemsPerPage
  if (config.defaultItemsPerPage) {
    if (config.verbose) {
      print.head('You included "defaultItemsPerPage". We\'ll include this many items per page in GET requests.');
    }
  } else {
    // Set defaultItemsPerPage to 3
    config.defaultItemsPerPage = 100;
    if (config.verbose) {
      print.head('You didn\'t include "defaultItemsPerPage". We\'ll include 100 items per page in GET requests.');
    }
  }

  // Developer credentials
  if (apiEnabled && !config.disableAuthorization) {
    // API is enabled and we want automatic authorization (not possible
    // without developerCredentials)
    if (!config.developerCredentials) {
      // No developerCredentials
      throw new Error('"disableAuthorization" is falsy (authorization is on) but "developerCredentials" were not included. We need them for the authorization process.');
    } else if (
      !config.developerCredentials.client_id
      || !config.developerCredentials.client_secret
    ) {
      // developerCredentials not in correct form
      throw new Error('"disableAuthorization" is falsy (authorization is on). We need developer credentials for the authorization process. "developerCredentials" were included but we couldn\'t find either "developerCredentials.client_id" or "developerCredentials.client_secret".');
    }
  }

  // Authorization
  if (apiEnabled && !config.disableAuthorization) {
    // API is enabled and authorization is enabled
    if (config.verbose) {
      print.head('Authorization enabled');
    }
    // authorizePath
    if (!config.authorizePath) {
      config.authorizePath = '/authorize';
      if (config.verbose) {
        print.sub('No "authorizePath" was included. We\'ll use \'/authorize\'. When a user visits that path, they will be directed to the authorization page.');
      }
    } else {
      if (config.verbose) {
        print.sub('"authorizePath" was included. When a user visits that path, they will be directed to the authorization page.');
      }
    }
    // TODO: defaultAuthorizedRedirect
    // TODO: tokenStore
  }

  // TODO: API FORWARDING

  // TODO: LTI


  return config;
};
