const print = require('../print.js');

module.exports = (config) => {
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

  return config;
};
