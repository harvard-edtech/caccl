const print = require('./print.js');

module.exports = (config = {}) => {
  const type = config.type || 'script';

  if (type === 'script') {
    // No requirements at all!
    // If verbose, give more information about accessToken and canvasHost
    if (config.verbose) {
      if (!config.accessToken) {
        print.head('You didn\'t include "accessToken"');
        print.sub('You\'ll need to include "accessToken" in every api request you make.');
      }
      if (!config.canvasHost) {
        print.head('You didn\'t include "canvasHost"');
        print.sub('You\'ll need to include "canvasHost" in every api request you make.');
      }
    }
  } else if (type === 'server') {
    // Note whether or not we'll be generating a new app

    



  } else if (type === 'client') {

  }

  if (config.verbose) {
    console.log('');
  }


   * @param {number} [defaultNumRetries] - Number of times to retry a
   *   request
   * @param {number} [defaultItemsPerPage] - Number of items to request
   *   on a get request
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
   *   { consumer_id, consumer_secret}. Required if type is 'server'
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
};
