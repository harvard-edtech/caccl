const API = require('../caccl-canvas-api'); // TODO: use real module
const initTokenManager = require('../caccl-token-manager'); // TODO: use real module
const initLTIManager = require('../caccl-lti-manager'); // TODO: use real module

const genExpressApp = require('./genExpressApp.js');

/**
 * Initializes the CACCL library
 * @author Gabriel Abrams
 * @param {string} [type=script] - the type of app being initialized. If
 *   'script', only the API is returned. If 'server', api is added via
 *   middleware as req.api (if user is authenticated) and we add an LTI launch
 *   path, and a "kickoff authorization" path.
 * @param {string} [accessToken] - a default access token to apply to all
 *   requests. Only valid if type is 'script'
 * @param {string} [canvasHost=canvas.instructure.com] - a default canvas host
 *   to use for all requests
 * @param {string} [apiConfig.cacheType=none] - If 'memory', cache is stored in
 *   memory. If 'session', cache is stored in express the session. To include a
 *   custom cache, include it as apiConfig.cache
 * @param {object} [apiConfig.cache] - Custom cache manager instance. Not
 *   required if using 'memory' or 'session' cacheType (those caches are
 *   built-in)
 * @param {function} [apiConfig.sendRequest] - Function that sends a request to
 *   the Canvas API. Defaults to axios-based request sender (which we recommend)
 * @param {number} [apiConfig.defaultNumRetries] - Number of times to retry a
 *   request
 * @param {number} [apiConfig.defaultItemsPerPage] - Number of items to request
 *   on a get request
 * @param {array.<string>} [routesWithAPI=['*']] - the list of routes where the
 *   api should be added to as req.api
 * @param {object} [developerCredentials] - canvas app developer credentials in
 *   the form { client_id, client_secret }. Required if type is 'server'
 * @param {string} [authorizePath=/authorize] - the route to add to the express
 *   app (when a user visits this route, we will attempt to refresh their token
 *   and if we can't, we will prompt them to authorize the tool). All types of
 *   requests are listened for: POST, GET, etc.
 * @param {string} [defaultAuthorizedRedirect=authorizePath + '/done'] - the
 *   default route to visit after authorization is complete (you can override
 *   this value for a specific authorization call by including query.next or
 *   body.next, a path/url to visit after completion)
 * @param {object|null} [tokenStore=memory token store] - null to turn off
 *   storage of refresh tokens, exclude to use memory token store,
 *   or include a custom token store of form { get(key), set(key, val) } where
 *   both functions return promises
 * @param {string} [consumerKey] - the installation consumer key to use to
 *   verify LTI launch requests. Required if type is 'server'
 * @param {string} [consumerSecret] - the installation consumer secret to use
 *   to verify LTI launch requests. Required if type is 'server'
 * @param {string} [launchPath=/launch] - the path to accept POST launch
 *   requests from Canvas
 * @param {string} [redirectToAfterLaunch=same as launchPath] - the path to
 *   redirect to after a successful launch
 * @param {object} [nonceStore=memory store] - a nonce store to use for
 *   keeping track of used nonces of form { check } where check is a function:
 *   (nonce, timestamp) => Promise that resolves if valid, rejects if invalid
 * @param {boolean} [authorizeOnLaunch=false] - if truthy, user is automatically
 *   authorized upon launch
 */
 // TODO: Add express app config options to config above
 // TODO: Group config options into objects so that it is easier to input and
 //   read
 // TODO: Validate config object and give human-readable feedback
module.exports = (config = {}) => {
  const type = config.type || 'script';

  // Set up script
  if (type === 'script') {
    const apiConfig = config.apiConfig || {};
    return new API({
      accessToken: config.accessToken,
      canvasHost: config.canvasHost,
      cacheType: apiConfig.cacheType,
      cache: apiConfig.cache,
      sendRequest: apiConfig.sendRequest,
      defaultNumRetries: apiConfig.defaultNumRetries,
      defaultItemsPerPage: apiConfig.defaultItemsPerPage,
    });
  }

  // Initialize express app (if not already done)
  const app = config.app || genExpressApp();

  // TODO: add param autoAuthorizeOnLaunch and if truthy, sets
  // redirectToAfterLaunch

  // Set up server
  if (type === 'server') {
    // > Add token manager and have it auto-refresh routesWithAPI
    const updatedAuthorizePath = initTokenManager({
      app,
      canvasHost: config.canvasHost,
      developerCredentials: config.developerCredentials,
      authorizePath: config.authorizePath,
      defaultAuthorizedRedirect: config.defaultAuthorizedRedirect,
      autoRefreshRoutes: (config.routesWithAPI || ['*']),
      tokenStore: config.tokenStore,
    });

    // > Initialize LTI manager
    initLTIManager({
      app,
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
      launchPath: config.launchPath,
      redirectToAfterLaunch: config.redirectToAfterLaunch,
      nonceStore: config.nonceStore,
      authorizePath: updatedAuthorizePath,
      authorizeOnLaunch: config.authorizeOnLaunch,
    });

    // > Install middleware to add req.api
    (config.routesWithAPI || ['*']).forEach((route) => {
      app.use(route, (req, res, next) => {
        // Don't add api if we don't have an access token
        if (
          !req.session
          || !req.session.accessToken
        ) {
          return next();
        }

        // Add api
        req.api = new API({
          req,
          accessToken: req.session.accessToken,
          canvasHost: config.canvasHost,
          cache: apiConfig.cache,
          sendRequest: apiConfig.sendRequest,
          defaultNumRetries: apiConfig.defaultNumRetries,
          defaultItemsPerPage: apiConfig.defaultItemsPerPage,
        });
        return next();
      });
    });
  }
};
