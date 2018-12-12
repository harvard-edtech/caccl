const API = require('caccl-api');
const validateConfigAndSetDefaults = require('./validateConfigAndSetDefaults/script.js');

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
    defaultNumRetries: config.defaultNumRetries,
    defaultItemsPerPage: config.defaultItemsPerPage,
  });
};
