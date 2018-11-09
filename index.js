const API = require('../caccl-canvas-api'); // TODO: use real module
const initTokenManager = require('../caccl-token-manager'); // TODO: use real module
const initLTIManager = require('../caccl-lti-manager'); // TODO: use real module
const initAPIForwarding = require('../caccl-api-forwarder'); // TODO: use real module

const validateConfigAndSetDefaults = require('./validateConfigAndSetDefaults/index.js');

/**
 * Initializes the CACCL library
 * @author Gabriel Abrams
 * @param {string} [type=server] - the type of app being initialized. If
 *   'script', only the API is returned. If 'server', api is added via
 *   middleware as req.api (if user is authenticated) and we add an LTI launch
 *   path, and a "kickoff authorization" path.
 *
 * APP:
 * @param {object} [app=generate new express app] - the express app to use and
 *   add middleware to. Required if type is 'server'. If excluded and type is
 *   'server', we generate a new express app (see sessionSecret, cookieName, and
 *   sessionMins, onListenSuccess, onListenFail, sslKey, sslCertificate, sslCA)
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
 *   to start listening for requests. Argument: error. . Only valid if app is
 *   excluded
 * @param {string} [sslKey] - ssl key to use to secure the connection. Only
 *   valid if both sslKey and sslCertificate are included. Only valid if app is
 *   excluded
 * @param {string} [sslCertificate] - ssl certificate  to use to secure the
 *   connection. Only valid if both sslKey and sslCertificate are included. Only
 *   valid if app is excluded
 * @param {string|array.<string>} [sslCA] - certificate chain linking a
 *   certificate authority to our ssl certificate. If string, certificates will
 *   be automatically split. Only valid if app is excluded
 *
 * API:
 * @param {boolean} [disableServerSideAPI] - if falsy, automatically adds
 *   req.api to routes encapsulated by routesWithAPI
 * @param {string} [accessToken] - a default access token to apply to all
 *   requests
 * @param {string} [canvasHost=canvas.instructure.com] - a default canvas host
 *   to use for all requests
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
 * @param {boolean} [disableAuthorization] - if falsy and type is 'server',
 *   sets up automatic authorization when the user visits authorizePath. Only
 *   valid if type is 'server'
 * @param {object} [developerCredentials] - canvas app developer credentials in
 *   the form { client_id, client_secret }. Required if type is 'server'
 * @param {array.<string>} [routesWithAPI=['*']] - the list of routes where the
 *   api should be added to as req.api. Only valid if enableServerSideAPI is
 *   truthy
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
 *
 * API Forwarding:
 * @param {boolean} [disableClientSideAPI] - if falsy, adds appropriate
 *   functionality to allow client-side access to the api. If type is 'server',
 *   we add api forwarding (see apiForwardPathPrefix). If type is 'client', we
 *   return an api object that forwards requests to the server
 * @param {string} [apiForwardPathPrefix=/canvas] - API forwarding path prefix
 *   to add to all forwarded api requests. If type is 'server', this is the
 *   prefix we use to listen for forwarded requests
 *   (ex: /canvas/api/v1/courses). If type is 'client', this is the prefix we
 *   prepend to all requests when sending them to the server for forwarding to
 *   Canvas
 *
 * LTI:
 * @param {boolean} [disableLTI] - if falsy, starts listening for LTI launches
 *   at launchPath
 * @param {object} [installationCredentials] - installation consumer credentials
 *   to use to verify LTI launch requests in the form
 *   { consumer_key, consumer_secret}. Required if type is 'server'
 * @param {string} [launchPath=/launch] - the path to accept POST launch
 *   requests from Canvas
 * @param {string} [redirectToAfterLaunch=same as launchPath] - the path to
 *   redirect to after a successful launch
 * @param {object} [nonceStore=memory store] - a nonce store to use for
 *   keeping track of used nonces of form { check } where check is a function:
 *   (nonce, timestamp) => Promise that resolves if valid, rejects if invalid
 * @param {boolean} [authorizeOnLaunch=false] - if truthy, user is automatically
 *   authorized upon launch. If truthy, type must be 'server' and either
 *   disableClientSideAPI or disableServerSideAPI must be falsy
 */
module.exports = (oldConfig = {}) => {
  // Validate config
  const config = validateConfigAndSetDefaults(oldConfig);

  // Set up script
  if (config.type === 'script') {
    return new API({
      accessToken: config.accessToken,
      canvasHost: config.canvasHost,
      cacheType: config.cacheType,
      cache: config.cache,
      sendRequest: config.sendRequest,
      defaultNumRetries: config.defaultNumRetries,
      defaultItemsPerPage: config.defaultItemsPerPage,
    });
  }

  // Set up server
  if (config.type === 'server') {
    /**
     * Adds the api to a request object, using the canvasHost and accessToken
     *   stored in the session (if possible), falling back on defaults set in
     *   the config
     * @author Gabriel Abrams
     * @param {object} [req] - express request object
     */
    const addAPIToReq = (req) => {
      // Use current user's values or defaults
      const canvasHost = (req.session.canvasHost || config.canvasHost);
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

    // Add token manager and have it auto-refresh routesWithAPI and addAPIToReq
    // upon manual login
    if (!config.disableAuthorization) {
      // Set up the list of routes to auto-refresh access tokens
      const autoRefreshRoutes = config.routesWithAPI;
      // Add forward paths as well (if client-side api is enabled)
      if (!config.disableClientSideAPI) {
        autoRefreshRoutes.push(`${config.apiForwardPathPrefix}*`);
      }

      initTokenManager({
        app: config.app,
        canvasHost: config.canvasHost,
        developerCredentials: config.developerCredentials,
        authorizePath: config.authorizePath,
        defaultAuthorizedRedirect: config.defaultAuthorizedRedirect,
        autoRefreshRoutes: config.routesWithAPI,
        tokenStore: config.tokenStore,
        onManualLogin: addAPIToReq,
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
        authorizePath: config.authorizePath,
        authorizeOnLaunch: config.authorizeOnLaunch,
      });
    }

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

    return config.app;
  }
};
