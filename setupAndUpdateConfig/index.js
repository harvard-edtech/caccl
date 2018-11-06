const print = require('../print.js');

// setup and update functions by type
const script = require('./script.js');
const server = require('./server.js');
const client = require('./client.js');

// Checks caccl type and uses appropriate validator
module.exports = (oldConfig = {}) => {
  const config = oldConfig;

  // Set default type to 'script'
  if (!config.type) {
    config.type = 'script';

    // Print help
    if (config.verbose) {
      print.head('You didn\'t include a type. We will be using \'script\'.');
      print.sub('You can set up CACCL using "type" = either \'script\', \'server\', or \'client\'.');
    }
  } else if (
    config.type !== 'script'
    && config.type !== 'server'
    && config.type !== 'client'
  ) {
    // Invalid type
    throw new Error('Invalid "type". Must be either \'script\', \'server\', or \'client\'.');
  }

  // Use appropriate function
  if (config.type === 'script') {
    return script(config);
  } else if (config.type === 'server') {
    return server(config);
  } else {
    return client(config);
  }
};
