const genExpressApp = require('./genExpressApp');

genExpressApp({
  port: 443,
});

genExpressApp({
  port: 8088,
  forceSSL: true,
});
