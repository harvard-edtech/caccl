const initPartialSimulation = require('caccl-canvas-partial-simulator');
const path = require('path');

/* eslint-disable no-console */

// Printing helpers
const W = process.stdout.columns;
// Calculates the number of spaces on the left of a centered line
const leftBuffer = (message) => {
  return (Math.floor(W / 2) - 1 - Math.ceil(message.length / 2));
};
// Calculates the number of spaces on the right of a centered line
const rightBuffer = (message) => {
  return (Math.ceil(W / 2) - 1 - Math.floor(message.length / 2));
};
// Centers and surrounds text with a border (on left and right)
const printMiddleLine = (str) => {
  console.log(
    '\u2551'
    + ' '.repeat(leftBuffer(str))
    + str
    + ' '.repeat(rightBuffer(str))
    + '\u2551'
  );
};

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
  onSuccess: (port) => {
    // Simulation started
    console.log('\n\n');
    // Print top line
    console.log('\u2554' + '\u2550'.repeat(W - 2) + '\u2557');

    // Print middle lines
    printMiddleLine('Partially-simulated Canvas environment running!');
    printMiddleLine('To launch your app, visit:');
    printMiddleLine(`https://localhost:${port}/courses/${courseId}`);

    // Print bottom line
    console.log('\u255A' + '\u2550'.repeat(W - 2) + '\u255D');

    console.log('\nTo launch from other courses, visit:');
    console.log(`https://localhost:${port}/courses/<courseid>`);
  },
});
