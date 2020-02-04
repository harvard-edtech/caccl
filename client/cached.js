// Import stringify library
const stringify = require('fast-json-stable-stringify');

// Import local modules
const initCACCL = require('.');

const cacclInstanceCache = {}; // jsonified config => CACCL instance

/**
 * Memoized version of the initialization function. If given the same config
 *   options, this function will return the previously initialized caccl
 *   instance
 * @author Gabe Abrams
 * @param {object} config - the same arguments as allowed in /client/index.js
 * @return {object} same response as /client/index.js
 */
module.exports = (config = {}) => {
  const cacheKey = stringify(config);

  // Create new instance if not already available
  if (!cacclInstanceCache[cacheKey]) {
    cacclInstanceCache[cacheKey] = initCACCL(config);
  }

  return cacclInstanceCache[cacheKey];
};
