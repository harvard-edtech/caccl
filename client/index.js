const API = require('caccl-api');
const sendRequest = require('caccl-send-request');

const validateConfigAndSetDefaults = require('../validateConfigAndSetDefaults/client');

/**
 * Initializes the CACCL library
 * @author Gabriel Abrams
 * @param {string} [cacheType=memory] - If 'memory', cache is stored in
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
 * @param {string} [apiForwardPathPrefix=/canvas] - API forwarding path prefix
 *   to add to all forwarded api requests. This is the prefix we
 *   prepend to all requests when sending them to the server for forwarding to
 *   Canvas
 * @param {string} [serverHost] - Host name of the server to send forwarded
 *   api requests to. Defaults to no host (send requests to the same host that
 *   is serving the client)
 * @return {object} { api, getLaunchInfo } where api is a caccl-api instance and
 *   getLaunchInfo is a function that returns a promise that resolves with a
 *   json object containing launch info
 */
module.exports = (oldConfig = {}) => {
  // Validate config
  const config = validateConfigAndSetDefaults(oldConfig);

  // Set up dev environment (if applicable)
  const thisIsDevEnvironment = (
    process.env.NODE_ENV === 'development'
    || process.env.DEV
  );
  const devServerHost = (
    thisIsDevEnvironment
      ? 'localhost'
      : null
  );
  const canvasHost = (
    config.serverHost
      ? config.serverHost
      : devServerHost
  );

  // Initialize the API
  const api = new API({
    canvasHost,
    cacheType: (
      config.cacheType === undefined
        ? 'memory'
        : config.cacheType
    ),
    sendRequest: config.sendRequest,
    defaultNumRetries: config.defaultNumRetries,
    itemsPerPage: config.itemsPerPage,
    apiPathPrefix: config.apiForwardPathPrefix,
  });

  // Create a function that fetches launch info from the server
  // Resolves with: { launched, authorized, launchInfo }
  const getStatus = () => {
    return sendRequest({
      host: canvasHost,
      path: `${config.apiForwardPathPrefix}/status`,
      method: 'GET',
    })
      .then((data) => {
        return data.body;
      });
  };

  // Give client a function for calling the server
  // Client should use this to call the server so that the client contacts the
  // correct server while using the development environment
  const clientSendRequest = (opts = {}) => {
    const newOpts = opts;
    if (!opts.host) {
      newOpts.host = canvasHost;
    }
    return sendRequest(newOpts);
  };

  return {
    api,
    getStatus,
    sendRequest: clientSendRequest,
  };
};
