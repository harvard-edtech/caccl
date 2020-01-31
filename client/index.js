const API = require('caccl-api');
const sendRequest = require('caccl-send-request');

const validateConfigAndSetDefaults = require('../validateConfigAndSetDefaults/client');

/**
 * Initializes the CACCL library
 * @author Gabe Abrams
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

  /**
   * Get launch info from the server
   * @author Gabe Abrams
   * @return {object} status object with the following properties:
   *   { launched, authorized, launchInfo } where launched is true if the user
   *   has launched via LTI, authorized is true if the user is authorized to
   *   use the API, and launchInfo is the launchInfo object documented in
   *   caccl-lti
   */
  const getStatus = async () => {
    const { body } = await sendRequest({
      host: canvasHost,
      path: `${config.apiForwardPathPrefix}/status`,
      method: 'GET',
    });

    return body;
  };

  /**
   * Send request while setting the default hostname to the server
   * @author Gabe Abrams
   * @param {object} opts - the same object/arguments that are accepted by
   *   the sendRequest function as detailed in caccl-send-request
   */
  const clientSendRequest = (opts = {}) => {
    const newOpts = opts;
    if (!opts.host) {
      newOpts.host = canvasHost;
    }
    return sendRequest(newOpts);
  };

  /**
   * Send grade passback via the server. If the server has turned off
   *   clientside grade passback, or if the current user didn't launch through
   *   an external assignment, this function may not work.
   * @author Gabe Abrams
   * @param {object} request - an object containing all the information for
   *   the passback request
   * @param {string} [request.text] - the text of the submission. If this is
   *   included, url cannot be included
   * @param {string} [request.url] - a url to send as the student's
   *   submission. If this is included, text cannot be included
   * @param {number} [request.score] - the student's score on this assignment
   * @param {number} [request.percent] - the student's score as a percent
   *   (0-100) on the assignment
   * @param {Date|string} [request.submittedAt=now] - a timestamp for when the
   *   student submitted the grade. The type must either be a Date object or
   *   an ISO 8601 formatted string
   * @return {object} json response from Canvas
   */
  const sendPassback = async (request) => {
    const { body } = sendRequest({
      host: canvasHost,
      path: `${config.apiForwardPathPrefix}/gradepassback`,
      method: 'POST',
      params: request,
    });

    return body;
  };

  // Build the initialized object
  return {
    api,
    getStatus,
    sendPassback,
    sendRequest: clientSendRequest,
  };
};
