const initCACCL = require('.');

const cacclInstanceCache = {}; // jsonified config => CACCL instance

module.exports = (config = {}) => {
  const cacheKey = JSON.stringify(config);

  // Create new instance if not already available
  if (!cacclInstanceCache[cacheKey]) {
    cacclInstanceCache[cacheKey] = initCACCL(config);
  }

  return cacclInstanceCache[cacheKey];
};
