const API = require('caccl-api');
const initAuthorizer = require('caccl-authorizer');
const initLTIManager = require('caccl-lti');
const initAPIForwarding = require('caccl-api-forwarder');

const validateConfigAndSetDefaults = require('../validateConfigAndSetDefaults/server');

/**
 * Initializes the CACCL library
 * @author Gabriel Abrams
 * APP:
 * @param {object} [app=generate new express app] - the express app to use and
 *   add middleware to. If excluded, we generate a new express app (see
 *   sessionSecret, cookieName, sessionMins, onListenSuccess, onListenFail,
 *   sslKey, sslCertificate, sslCA)
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
 * @param {number} [defaultItemsPerPage] - Number of items to request
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
module.exports = (oldConfig = {}) => {
  // Validate config
  const config = validateConfigAndSetDefaults(oldConfig);

  // Set up CORS
  if (config.clientOrigin) {
    config.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', config.clientOrigin);
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
      );
      next();
    });
  }

  /**
   * Adds the api to a request object, using the canvasHost and accessToken
   *   stored in the session (if possible), falling back on defaults set in
   *   the config
   * @author Gabriel Abrams
   * @param {object} [req] - express request object
   */
  const addAPIToReq = (req) => {
    // Use current user's values or defaults
    const canvasHost = (
      config.dontUseLaunchCanvasHost
        ? config.canvasHost
        : req.session.canvasHost || config.canvasHost
    );
    const accessToken = (req.session.accessToken || config.accessToken);

    // Add api
    req.api = new API({
      req,
      canvasHost,
      accessToken,
      cache: config.cache,
      sendRequest: config.sendRequest,
      defaultNumRetries: config.defaultNumRetries,
      defaultItemsPerPage: config.defaultItemsPerPage,
    });
  };

  // Add server-side api
  if (!config.disableServerSideAPI) {
    // Install middleware to add req.api
    config.routesWithAPI.forEach((route) => {
      config.app.use(route, (req, res, next) => {
        // Don't add api if we don't have an access token
        if (
          !req.session
          || !req.session.accessToken
        ) {
          return next();
        }

        // Add api
        addAPIToReq(req);

        return next();
      });
    });
  }

  // Add LTI support: initialize LTI manager
  if (!config.disableLTI) {
    initLTIManager({
      app: config.app,
      installationCredentials: config.installationCredentials,
      launchPath: config.launchPath,
      redirectToAfterLaunch: config.redirectToAfterLaunch,
      nonceStore: config.nonceStore,
      authorizePath: config.launchPath,
      disableAuthorizeOnLaunch: config.disableAuthorizeOnLaunch,
    });
  }

  // Add token manager and have it auto-refresh routesWithAPI and addAPIToReq
  // upon manual login
  if (!config.disableAuthorization) {
    // Set up the list of routes to auto-refresh access tokens
    const autoRefreshRoutes = config.routesWithAPI;
    // Add forward paths as well (if client-side api is enabled)
    if (!config.disableClientSideAPI) {
      autoRefreshRoutes.push(`${config.apiForwardPathPrefix}*`);
    }

    initAuthorizer({
      app: config.app,
      canvasHost: config.canvasHost,
      developerCredentials: config.developerCredentials,
      launchPath: config.launchPath,
      defaultAuthorizedRedirect: config.defaultAuthorizedRedirect,
      autoRefreshRoutes: config.routesWithAPI,
      tokenStore: config.tokenStore,
      onManualLogin: addAPIToReq,
      simulateLaunchOnAuthorize: config.simulateLaunchOnAuthorize,
    });
  }

  // Add client-side api support (api forwarding)
  if (!config.disableClientSideAPI) {
    initAPIForwarding({
      app: config.app,
      canvasHost: config.canvasHost,
      accessToken: config.accessToken,
      apiForwardPathPrefix: config.apiForwardPathPrefix,
      numRetries: config.defaultNumRetries,
    });
  }

  // Add launch info support
  config.app.get(config.apiForwardPathPrefix + '/launchinfo', (req, res) => {
    const launchInfo = (
      (req.session && req.session.launchInfo)
        ? req.session.launchInfo
        : {}
    );
    return res.json(launchInfo);
  });

  return config.app;
};
