const API = require('../caccl-canvas-api'); // TODO: use real module


/**
 * Initializes the CACCL library
 * @param {string} [type=script] - the type of app being initialized. If
 *   'script', only the API is returned
 * @param {string} [accessToken] - a default access token to apply to all
 *   requests. Only valid if type is 'script'
 * @param {string} [canvasHost] - a default canvas host to use for all requests
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
 * @return {object} api (if type is script)
 */

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
};
