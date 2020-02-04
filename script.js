const API = require('caccl-api');

const validateConfigAndSetDefaults = require('./validateConfigAndSetDefaults/script');

/**
 * Initialize a caccl-enabled script
 * @author Gabe Abrams
 * @param {string} [config.accessToken] - An access token to add to all
 *   requests. Can be overridden by including `access_token` query/body
 *   parameter.
 * @param {string} [config.canvasHost=canvas.instructure.com] - The hostname
 *   to use when sending requests to the Canvas API. Can be overridden for an
 *   individual request by including `host` option. If canvasHost is null, no
 *   hostname is prepended to the request path
 * @param {string} [config.cacheType] - If 'memory', cache is stored in
 *   memory. If 'session' and req is included, cache is stored in express
 *   session. To include a custom cache, include it as config.cache
 * @param {object} [config.cache] - Custom cache manager class. Required if
 *   using 'custom' cacheType.
 * @param {function} [config.sendRequest] - Function that sends a request to
 *   the Canvas API. Defaults to HTTPS request sender.
 * @param {number} [config.numRetries=3] - Number of times to retry a
 *   request. Can be overridden for an individual request by including
 *   numRetries option
 * @param {number} [config.itemsPerPage=100] - Number of items to
 *   request on a get request. Can be overridden for an individual request by
 *   including numPerPage option
 * @return {caccl-api instance} instance of caccl-api {@link https://harvard-edtech.github.io/caccl-api}
 */
module.exports = (oldConfig) => {
  // Validate config
  const config = validateConfigAndSetDefaults(oldConfig);

  // Set up script
  return new API({
    accessToken: config.accessToken,
    canvasHost: config.canvasHost,
    cacheType: config.cacheType,
    cache: config.cache,
    sendRequest: config.sendRequest,
    numRetries: config.numRetries,
    itemsPerPage: config.itemsPerPage,
  });
};
