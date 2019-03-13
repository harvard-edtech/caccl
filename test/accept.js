const genExpressApp = require('../genExpressApp');

genExpressApp({
  port: 443,
});

genExpressApp({
  port: 8088,
  forceSSL: true,
});

/* eslint-disable no-console */
console.log('Visit the following urls in all browsers you plan to test in:');
console.log('https://localhost/verifycert');
console.log('https://localhost:8088/verifycert');
