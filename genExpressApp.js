const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const randomstring = require('randomstring');

/**
 * Creates a new express app with memory-based session, listening on env PORT or
 *   8080, and with randomized session secret and cookie name.
 * @author Gabriel Abrams
 * @return {object} express app
 */
module.exports = () => {
  const app = express();
  const port = process.env.PORT || 8080;

  // Set up body json parsing
  app.use(bodyParser.json({
    limit: '5mb'
  }));

  // Set up body application/x-www-form-urlencoded parsing
  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '5mb'
  }));

  // Set up session (memory-based)
  // > Create random session secret
  const sessionSecret = randomstring.generate(48);
  // > Create cookie name
  const cookieName = `CACCL-based-app-session-${new Date().getTime()}-${randomstring.generate(10)}`;
  // > Set session duration to 6 hours
  const sessionDurationMillis = (6 * 60 * 60000);
  // > Add session
  app.use(session({
    cookie: {
      maxAge: sessionDurationMillis
    },
    resave: true,
    name: cookieName,
    saveUninitialized: false,
    secret: sessionSecret
  }));

  // Start server
  let server = http.createServer(app);
  server.listen(port).on('listening', (err) => {
    if (err) {
      console.log(`An error occurred while trying to listen on port ${port}:`, err);
    } else {
      console.log(`Now listening on port ${port}`);
    }
  });

  return app;
};
