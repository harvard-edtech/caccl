const initPrint = require('./helpers/initPrint');

/**
 * Validates script configuration options and makes changes (sets defaults etc.)
 * @author Gabe Abrams
 * @param {object} oldConfig - the current configuration object
 * @return {object} the new configuration object
 */
module.exports = (oldConfig) => {
  const config = oldConfig;
  const print = initPrint(config.verbose);

  // No requirements at all!
  // If verbose, give more information about accessToken and canvasHost
  if (config.accessToken) {
    print.variable('accessToken', true, 'we\'ll use this access token to authenticate every request');
  } else {
    print.variable('accessToken', false, 'you\'ll need to include "accessToken" in every api request you make');
  }
  if (config.canvasHost) {
    print.variable('canvasHost', true, `we'll send requests to ${config.canvasHost}`);
  } else {
    config.canvasHost = 'canvas.instructure.com';
    print.variable('canvasHost', false, `we'll use ${config.canvasHost}. If you want to use a different host, include "canvasHost" in the individual request`);
  }

  return config;
};
