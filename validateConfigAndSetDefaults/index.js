const initPrint = require('./helpers/initPrint.js');

// setup and update functions by type
const script = require('./script.js');
const server = require('./server.js');
const client = require('./client.js');

// Checks caccl type and uses appropriate validator
module.exports = (oldConfig = {}) => {
  let config = oldConfig;
  const print = initPrint(config.verbose);

  // Set default type to 'script'
  if (!config.type) {
    config.type = 'server';
  } else if (
    config.type !== 'script'
    && config.type !== 'server'
    && config.type !== 'client'
  ) {
    // Invalid type
    throw new Error('Invalid "type". Must be either \'script\', \'server\', or \'client\'.');
  }

  if (config.verbose) {
    print.head('Configuration Setup Notes:');
    print.variable('type', false, 'you didn\'t include a type, so we will be using \'script\'');
    print.subtitle('You can set up CACCL using "type" = either \'script\', \'server\', or \'client\'.');
  }

  // Use appropriate function
  if (config.type === 'script') {
    config = script(config);
  } else if (config.type === 'server') {
    config = server(config);
  } else {
    config = client(config);
  }

  if (config.verbose) {
    console.log('\n\n');
  }
  return config;
};
