const API = require('../../caccl-api'); // TODO: use real module
const validateConfigAndSetDefaults = require('../validateConfigAndSetDefaults/client.js');

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
 * @param {number} [defaultItemsPerPage] - Number of items to request
 *   on a get request
 * @param {string} [apiForwardPathPrefix=/canvas] - API forwarding path prefix
 *   to add to all forwarded api requests. This is the prefix we
 *   prepend to all requests when sending them to the server for forwarding to
 *   Canvas
 * @param {string} [serverHost] - Host name of the server to send forwarded
 *   api requests to. Defaults to no host (send requests to the same host that
 *   is serving the client)
 */
module.exports = (oldConfig = {}) => {
  // Validate config
  const config = validateConfigAndSetDefaults(oldConfig);

  // Set up dev environment (if applicable)
  const devServerHost = (
    process.env.NODE_ENV === 'development'
      ? 'localhost'
      : undefined
  );


  return new API({
    canvasHost: (
      config.serverHost
        ? config.serverHost
        : devServerHost
    ),
    cacheType: (
      config.cacheType === undefined
        ? 'memory'
        : config.cacheType
    ),
    sendRequest: config.sendRequest,
    defaultNumRetries: config.defaultNumRetries,
    defaultItemsPerPage: config.defaultItemsPerPage,
    apiPathPrefix: config.apiForwardPathPrefix,
  });
};
