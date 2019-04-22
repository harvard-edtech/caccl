require('dce-selenium');

const testConfiguration = require('./testConfiguration');

/* eslint-disable-next-line no-console */
console.log('NOTE ON SSL: If running into connection/SSL issues, you may need to accept the SSL certificates. Use "npm run accept" and follow instructions.');

describeS('Server > Default Configuration', function () {
  itS('Passes all tests with default configuration', async function (driver) {
    await testConfiguration(driver);
  });
});

// TODO: keep writing tests, one for each configuration.
// Add more tests to /testConfiguration
