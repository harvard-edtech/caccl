const initPartialSimulation = require('caccl-canvas-partial-simulator');
const path = require('path');
const opn = require('opn');

const prompt = require('prompt-sync')();

module.exports = () => {
  // Attempt to get the environment config
  const launchDirectory = process.env.INIT_CWD;
  const devEnvPath = path.join(launchDirectory, 'config/devEnvironment.js');
  let devEnvironment;
  try {
    devEnvironment = require(devEnvPath); // eslint-disable-line global-require, import/no-dynamic-require, max-len
  } catch (err) {
    // Could not read the access token!
    console.log('We could not start a simulated Canvas environment:');
    console.log(`We couldn't read the development environment config which should be at: ${devEnvPath}`);
  }

  // Verify the contents of the devEnvirnoment
  if (
    !devEnvironment
    || !devEnvironment.courseId
    || !devEnvironment.canvasHost
    || !devEnvironment.accessToken
  ) {
    // Invalid environment
    console.log('We could not start a simulated Canvas environment:');
    console.log(`We read the config file at: ${devEnvPath}`);
    console.log('...but we didn\'t find all the required parameters:');
    console.log('- courseId\n- canvasHost\n- accessToken');
    process.exit(0);
  }

  // Extract the contents of the devEnvirnoment
  const {
    courseId,
    canvasHost,
    accessToken,
    launchURL,
  } = devEnvironment;

  console.log('Starting a partially-simulated Canvas instance:');
  console.log(`- Test course id: ${courseId}`);
  console.log(`- Actual Canvas host: ${canvasHost} (api traffic forwarded here)`);
  console.log(`- Access token: ${accessToken.substring(0, 10)}...`);
  if (launchURL) {
    console.log(`- App launch URL: ${launchURL}`);
  } else {
    console.log('- App launch URL: https://localhost/launch');
  }

  // Create a simulated Canvas environment
  initPartialSimulation({
    courseId,
    canvasHost,
    accessToken,
    launchURL,
    onSuccess: () => {
      // Simulation started
      console.log('\n\nPartially-simulated Canvas environment is now running.');
      console.log('Manually launch an app via: https://localhost:8088/courses/:courseid');
      console.log('or...\n');

      while (true) {
        console.log('Press enter to launch your app in the default browser, or');
        console.log('- enter "c" for Chrome');
        console.log('- enter "f" for Firefox');
        console.log('- enter "s" for Safari');
        console.log('- enter "ci" for Chrome Incognito');
        const option = prompt('> ');

        let browser;
        if (option) {
          if (option === 'c') {
            browser = {
              app: 'google chrome',
            };
          } else if (option === 'f') {
            browser = {
              app: 'firefox',
            };
          } else if (option === 's') {
            browser = {
              app: 'safari',
            };
          } else if (option === 'ci') {
            browser = {
              app: ['google chrome', '--incognito'],
            };
          }
        }

        opn(`https://localhost:8088/courses/${courseId}`, browser);
      }
    },
  });
};
