// Import libs
import express from 'express';
import session from 'express-session';
import { Store as SessionStoreType } from 'express-session';
import MemoryStore from 'memorystore';

// Import shared types
import SessionCollection from '../shared/types/SessionCollection';

// Import shared helpers
import getMangoStore from './getMangoStore';

// Check if this is a dev environment
const thisIsDevEnvironment = (process.env.NODE_ENV === 'development');

/**
 * Generate a new express app
 * @author Gabe Abrams
 * @param opts.express object containing all configuration for the app
 * @param [opts.express.port=env.PORT || 8080] port to listen to
 * @param [opts.express.sessionSecret=env.SESSION_SECRET || randomly generated]
 *   session secret to use when encrypting sessions
 * @param [opts.express.cookieName=env.COOKIE_NAME || randomly generated] cookie
 *   name to use when identifying this app's session. Must not contain tabs or
 *   spaces
 * @param [opts.express.sessionMins=env.SESSION_MINS || 360] number of minutes
 *   the session should last for
 * @param [opts.express.sessionStore=memory store] express-session store
 * @param [opts.express.sessionCollection] db collection instance to use for storing
 *   user sessions
 * @param [opts.express.minSessionVersion=env.MIN_SESSION_VERSION] only relevant if
 *   using a sessionCollection. This version number is the minimum app version number
 *   (from the top-level package.json) that will be allowed for user sessions. If a
 *   user's session was initialized while the app's version number was older than this
 *   value, the user's session will be destroyed
 * @param [opts.express.preprocessor] function to call after express app
 *   created but before any CACCL routes are added
 * @returns initialized express app
 */
const genExpressApp = (
  opts: {
    express?: {
      app?: express.Application,
      port?: number,
      sessionSecret?: string,
      cookieName?: string,
      sessionMins?: number,
      sessionStore?: SessionStoreType,
      sessionCollection?: SessionCollection,
      minSessionVersion?: string,
      preprocessor?: (app: express.Application) => void,
    },
  },
): express.Application => {
  // Get opts
  const port = Number.parseInt(
    String(
      opts.express?.port
      || process.env.PORT
      || 8080
    ),
    10,
  );
  const sessionSecret = String(
    opts.express?.sessionSecret
    || process.env.SESSION_SECRET
    || `session-${Date.now()}-${Math.random()}-${Math.random()}`
  );
  const cookieName = String(
    opts.express?.cookieName
    || process.env.COOKIE_NAME
    || `CACCL_Canvas_App_${Date.now()}${Math.round(Math.random() * 1000000)}${Math.round(Math.random() * 1000000)}`
  );
  const sessionMins = Number.parseFloat(String(
    opts.express?.sessionMins
    || process.env.SESSION_MINS
    || 360 // 6 hours
  ));
  const sessionStore: SessionStoreType = (
    // Full session store included
    opts.express?.sessionStore
    // Session collection included
    || (
      (opts.express?.sessionCollection)
        ? getMangoStore({
          sessionMins,
          sessionCollection: opts.express.sessionCollection,
          minSessionVersion: (
            opts.express.minSessionVersion
            ?? process.env.MIN_SESSION_VERSION
            ?? '0.0.0'
          ),
        })
        : undefined
    )
    // Create new memory store
    || new (MemoryStore(session))({
      checkPeriod: (sessionMins * 60000),
    })
  );

  // Initialize express
  const app = express();

  // Add body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Create cookie settings
  const cookie: { [k: string]: any } = {
    maxAge: (sessionMins * 60000),
  };

  // Add dev settings for cookie
  if (thisIsDevEnvironment) {
    cookie.sameSite = 'none';
    cookie.secure = true;
  }

  // Add express session
  app.use(session({
    cookie,
    store: sessionStore,
    resave: true,
    name: cookieName,
    saveUninitialized: false,
    secret: sessionSecret,
    rolling: true,
  }));

  // Serve the app
  if (thisIsDevEnvironment) {
    // Start a development server that uses HTTPS
    const serve = require('caccl-dev-server').default;
    serve({
      app,
      port,
    });
  } else {
    // Start a prod server
    app
      .listen(
        port,
        () => {
          console.log(`Listening on port: ${port}`)
        },
      )
      .on(
        'error',
        (err) => {
          console.log(`Could not listen on port: ${port}`);
          console.log(err);
          process.exit(1);
        },
      );
  }
  
  // Return the app
  return app;
};

export default genExpressApp;
