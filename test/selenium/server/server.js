require('dce-selenium');

const testConfiguration = require('./testConfiguration');

/* eslint-disable-next-line no-console */
console.log('NOTE ON SSL: If running into connection/SSL issues, you may need to accept the SSL certificates. Use "npm run accept" and follow instructions.');

describeS('Server > Initialization', function () {
  itS('Throws error when installation credentials are excluded and LTI is enabled', async function (driver) {
    await testConfiguration(driver, {
      disableLTI: false,
      installationCredentials: null,
    });
  });

  itS('Throws error when developer credentials are excluded and auth is enabled', async function (driver) {
    await testConfiguration(driver, {
      installationCredentials: {
        client_id: 'asdf',
        client_secret: 'asdf',
      },
      disableAuthorization: false,
    });
  });
});

describeS('Server > Default Configuration', function () {
  itS('Passes all tests with default configuration', async function (driver) {
    await testConfiguration(driver, {
      installationCredentials: {
        consumer_key: 'consumer_key',
        consumer_secret: 'consumer_secret',
      },
      developerCredentials: {
        client_id: 'client_id',
        client_secret: 'client_secret',
      },
    });
  });
});

// TODO: keep writing tests, one for each configuration. Add more tests to /testConfiguration
