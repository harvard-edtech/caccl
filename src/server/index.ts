// Import libs
import express from 'express';
import { Store as SessionStoreType } from 'express-session';

// Import caccl libs
import cacclSendRequest from 'caccl-send-request';
import initLTI, { getLaunchInfo, getSelfLaunchURL } from 'caccl-lti';
import initAPIForwarder from 'caccl-api-forwarder';
import initAuth, { getAccessToken } from 'caccl-authorizer';
import initAPI from 'caccl-api';
import cacclHandlePassback from 'caccl-grade-passback';
import InitCACCLStore from 'caccl-memory-store/lib/InitCACCLStore';
import CACCLError from 'caccl-error';
import LaunchType from 'caccl-lti/lib/types/LaunchType';
import API from 'caccl-api/lib/types/API';

// Import types from other CACCL libs
import DeveloperCredentials from 'caccl-authorizer/lib/shared/types/DeveloperCredentials';
import InstallationCredentials from 'caccl-lti/lib/shared/types/InstallationCredentials';
import SelfLaunchConfig from 'caccl-lti/lib/shared/types/SelfLaunchConfig';

// Import shared types
import CACCLStatus from './shared/types/CACCLStatus';
import ErrorCode from './shared/types/ErrorCode';
import ServerPassbackRequest from './shared/types/ServerPassbackRequest';

// Import shared constants
import CACCL_PATHS from './shared/constants/CACCL_PATHS';

// Import helpers
import genExpressApp from './helpers/genExpressApp';

// Check if this is a dev environment
const thisIsDevEnvironment = (process.env.NODE_ENV === 'development');

/*------------------------------------------------------------------------*/
/*                                 Caching                                */
/*------------------------------------------------------------------------*/

// Store credentials from most recent initialization
let mostRecentInstallationCreds: { [k: string]: string };

// Store whether certain features are disabled
let authDisabled: boolean;

/*------------------------------------------------------------------------*/
/*                                Functions                               */
/*------------------------------------------------------------------------*/

/*----------------------------------------*/
/*             Request Sender             */
/*----------------------------------------*/

/**
 * Send a request to another server
 * @author Gabe Abrams
 * @param opts object containing all arguments
 * @param opts.host hostname of the destination server
 * @param opts.path path of the server endpoint
 * @param opts.method http method of the request
 * @param [opts.params] object containing body/query parameters. Only allows
 *   one level of object nesting (values that are objects must be stringified
 *   using JSON.stringify and then parsed on the server)
 * @param [opts.header] object containing additional headers to include
 * @param [opts.numRetries=3] number of times to retry the request if a network
 *   error occurs
 * @returns response object
 */
const sendRequest = async (
  opts: {
    host: string,
    path: string,
    method: ('GET' | 'POST' | 'DELETE' | 'PUT'),
    params?: { [k in string]: any },
    headers?: { [k in string]: any },
    numRetries?: number,
  },
): Promise<{
  body: any,
  status: number,
  headers: { [k in string]: any },
}> => {
  return cacclSendRequest(opts);
};

/*----------------------------------------*/
/*             Status Checker             */
/*----------------------------------------*/

/**
 * Get CACCL status from the server
 * @author Gabe Abrams
 * @param req express request instance
 * @returns status
 */
const getStatus = async (req: express.Request): Promise<CACCLStatus> => {
  // Check LTI launch status
  const { launched, launchInfo } = getLaunchInfo(req);

  // Check if the user is authorized
  let authorized: boolean = false;
  if (!authDisabled) {
    try {
      authorized = !!(await getAccessToken(req));
    } catch (err) {
      // Error occurred while getting the access token. Not authorized
      authorized = false;
    }
  }

  // Build a status response and optionally check auth status
  let status: CACCLStatus;
  if (launched) {
    status = {
      launched,
      launchInfo,
      authorized,
    };
  } else {
    status = {
      launched: false,
    };
  }

  // Return status object
  return status;
};

/*----------------------------------------*/
/*             Grade Passback             */
/*----------------------------------------*/

/**
 * Send grade passback to Canvas
 * @author Gabe Abrams
 * @param opts object containing all arguments
 * @param opts.req express request instance
 * @param [opts.text] the text of the submission. If this is
 *   included, url cannot be included
 * @param [opts.url] a url to send as the student's
 *   submission. If this is included, text cannot be included
 * @param [opts.score] the student's score on this assignment
 * @param [opts.percent] the student's score as a percent
 *   (0-100) on the assignment
 * @param [opts.submittedAt=now] a timestamp for when the
 *   student submitted the grade. The type must either be a Date object or
 *   an ISO 8601 formatted string
 */
const handlePassback = async (
  opts: ServerPassbackRequest,
) => {
  // Destructure opts
  const {
    req,
    text,
    url,
    score,
    percent,
    submittedAt,
  } = opts;

  // Check LTI launch status
  const { launched, launchInfo } = getLaunchInfo(req);

  // Make sure the user has a valid session
  if (!launched) {
    throw new CACCLError({
      message: 'You cannot finish this assignment because your session has expired.',
      code: ErrorCode.NoLaunchInfo,
    });
  }

  // Make sure the request contains something to submit
  if (!text && !url) {
    throw new CACCLError({
      message: 'We could not send grades back to Canvas via passback because the request was empty.',
      code: ErrorCode.NoPassbackContent,
    });
  }

  // Make sure we have passback info
  if (launchInfo.launchType !== LaunchType.Assignment) {
    throw new CACCLError({
      message: 'We could not send grades back to Canvas via passback because we don\'t have a valid Canvas LTI assignment launch.',
      code: ErrorCode.NoAssignmentLaunch,
    });
  }
  if (
    !launchInfo.outcome?.sourcedId
    || !launchInfo.outcome?.url
  ) {
    throw new CACCLError({
      message: 'We could not send grades back to Canvas via passback because we don\'t have the information from Canvas to send the request.',
      code: ErrorCode.NoOutcomeInfo,
    });
  }

  // Make sure Canvas can accept the request
  if (
    (url && !launchInfo.outcome.urlSubmissionAccepted)
    || (text && !launchInfo.outcome.textSubmissionAccepted)
    || (score && !launchInfo.outcome.totalScoreAccepted)
    || (submittedAt && !launchInfo.outcome.submittedAtAccepted)
  ) {
    // Canvas cannot accept our request
    throw new CACCLError({
      message: 'We could not send grades back to Canvas via passback because Canvas does not support all of the parameters we want to send.',
      code: ErrorCode.PassbackParamNotAccepted,
    });
  }

  // Make sure we have credentials
  if (!mostRecentInstallationCreds) {
    throw new CACCLError({
      message: 'We could not send grades back to Canvas via passback because CACCL is not yet initialized.',
      code: ErrorCode.PassbackBeforeCACCLInitialized,
    })
  }

  // Get installation credentials
  const consumerSecret = mostRecentInstallationCreds[launchInfo.consumerKey];
  if (!consumerSecret) {
    throw new CACCLError({
      message: 'We could not send grades back to Canvas via passback because this app is not set up to be installed for this Canvas host.',
      code: ErrorCode.PassbackParamNotAccepted,
    });
  }

  // Send the passback request
  try {
    const success = await cacclHandlePassback({
      request: {
        text,
        url,
        score,
        percent,
        submittedAt: (submittedAt || (new Date()).toISOString()),
      },
      info: {
        sourcedId: launchInfo.outcome.sourcedId,
        url: launchInfo.outcome.url,
      },
      credentials: {
        consumerKey: launchInfo.consumerKey,
        consumerSecret,
      },
    });

    // Force failure if handlePassback fails
    if (!success) {
      throw new Error();
    }
  } catch (err) {
    throw new CACCLError({
      message: 'We could not send grades back to Canvas via passback because Canvas did not accept the appropriate updates.',
      code: ErrorCode.PassbackUnsuccessful,
    });
  }
};

/*----------------------------------------*/
/*                   API                  */
/*----------------------------------------*/

/**
 * Get a copy of the CACCL API instance for the current user (the current user
 *   must be launched and authorized)
 * @param opts object containing all arguments
 * @param opts.req express request instance
 * @param [opts.numRetries=3] default number of retries per request
 * @param [opts.itemsPerPage=100] default number of items to request
 *   per page
 * @returns CACCL API instance
 */
const getAPI = async (
  opts: {
    req: express.Request,
    numRetries?: number,
    itemsPerPage?: number,
  },
): Promise<API> => {
  // Error if auth is disabled
  if (authDisabled) {
    throw new CACCLError({
      message: 'Auth is not enabled, so you cannot get a copy of the API.',
      code: ErrorCode.NoAPIAuthDisabled,
    });
  }

  // Get user's launch info
  const { launched, launchInfo } = getLaunchInfo(opts.req);
  if (!launched || !launchInfo.canvasHost) {
    throw new CACCLError({
      message: 'We could not get a copy of the CACCL API because the current user has not launched via LTI.',
      code: ErrorCode.CantInitAPIWithoutLaunch,
    });
  }

  // Get user's token
  const accessToken = await getAccessToken(opts.req);
  if (!accessToken) {
    throw new CACCLError({
      message: 'We could not get a copy of the CACCL API because the current user is not authorized with Canvas.',
      code: ErrorCode.CantInitAPIWithoutAuth,
    });
  }

  // Initialize the API instance
  return initAPI({
    numRetries: opts.numRetries,
    itemsPerPage: opts.itemsPerPage,
    canvasHost: launchInfo.canvasHost,
    defaultCourseId: launchInfo.courseId,
    accessToken,
  });
};

/*----------------------------------------*/
/*                Redirects               */
/*----------------------------------------*/

/**
 * Redirect the user to the API authorization screen. Useful if the user
 *   is not authorized and you want to be authorized. This is usually
 *   not necessary if lti.authorizeAfterLaunch is set to true when
 *   initializing CACCL on the server. Only functional if Canvas API auth is
 *   enabled via CACCL on the server.
 * @author Gabe Abrams
 * @param res express response object
 */
const redirectToAuth = (res: express.Response) => {
  return res.redirect(CACCL_PATHS.AUTHORIZE);
};

/**
 * Redirect the user to the self-launch process. Only functional if
 *   self-launch is enabled via CACCL on the server.
 * @author Gabe Abrams
 * @param opts object containing all arguments
 * @param opts.res express response object
 * @param opts.courseId the Canvas id of the course to launch from
 * @param [opts.canvasHost=defaultCanvasHost] host of the
 *   Canvas instance containing the course to launch from
 * @param [opts.appId=look up appId] id for this app as it is installed in
 *   Canvas in the course
 * @param [selfLaunchState] self launch state to add to launchInfo
 *   so you can keep track of state through the self launch process. This
 *   object will appear at launchInfo.selfLaunchState. Must be JSONifiable.
 *   Note: this information will be passed in the URL, so it should not
 *   be sensitive data.
 */
const redirectToSelfLaunch = (
  opts: {
    res: express.Response,
    courseId: number,
    canvasHost?: string,
    appId?: number,
    selfLaunchState?: any,
  },
) => {
  return opts.res.redirect(getSelfLaunchURL(opts));
};

/*------------------------------------------------------------------------*/
/*                               Initializer                              */
/*------------------------------------------------------------------------*/

/**
 * Initialize a CACCL app server
 * @author Gabe Abrams
 * @param [opts] object containing all arguments
 * @param [opts.lti] object containing all LTI configuration params
 * @param [opts.lti.installationCredentials=env vars} an object where keys are
 *   LTI consumer keys and values are LTI shared secrets. If excluded, defaults
 *   to { [process.env.CONSUMER_KEY | 'consumer_key']: (process.env.CONSUMER_SECRET | 'consumer_secret') }
 * @param [opts.lti.authorizeAfterLaunch] if true, start the Canvas OAuth
 *   authorization process upon successful LTI launch
 * @param [opts.lti.initNonceStore=memory store factory] a function that creates
 *   a store for keeping track of used nonces
 * @param [opts.lti.selfLaunch] if included, self launches will be enabled and
 *   the app will be able to launch itself (redirect to the Canvas tool inside
 *   the course of interest)
 * @param [opts.lti.selfLaunch.initAppIdStore=memory store factory] a function
 *   that creates a store for keeping track of appIds
 * @param [opts.lti.selfLaunch.hostAppIdMap] map of appIds where
 *   keys are canvasHost strings and values are the appIds. Include appIds
 *   here if the appId is the same across the whole Canvas instance
 * @param [opts.lti.selfLaunch.courseAppIdMap] two-level map of appIds where the
 *   first key is the canvas host, the second key is the courseId, and values
 *   are the appIds. Include appIds here if the app is unique to specific
 *   courses
 * @param [opts.lti.selfLaunch.adminAccessTokenMap] map of Canvas admin access
 *   tokens that can be used to look up appIds when the appId is not in any of
 *   the appId maps. Keys are canvasHost strings and values are arrays of
 *   Canvas admin tokens that will be used to look up appIds. The tokens will
 *   be used in order: the first token will be used, then if that fails, the
 *   second token will be used, and so on.
 * @param [opts.lti.selfLaunch.defaultCanvasHost=process.env.DEFAULT_CANVAS_HOST] default Canvas host to use in
 *   self launches
 * @param [opts.api] object containing all api and authorization configuration
 *   params. Must be included if integrating with the Canvas API
 * @param [opts.api.developerCredentials] map of developer credentials
 *   to use when authorizing this app with canvas. If excluded, defaults to
 *   { [process.env.DEFAULT_CANVAS_HOST]: { [process.env.CLIENT_ID]: process.env.CLIENT_SECRET } }
 * @param [opts.api.initTokenStore=memory store factory] a function that
 *   creates a store for keeping track of user's API tokens and auth status
 * @param [opts.api.disableClientSideAPI] if true, do not allow the client
 *   to send Canvas API requests on behalf of the current user's auth
 *   credentials
 * @param [opts.express] object containing all express configuration params.
 *   If excluded, express is initialized with all defaults
 * @param [opts.express.app] manually-initialized express app that uses
 *   express-session. If excluded,
 *   express is initialized using all other properties of opts.express. If
 *   included, all other properties of opts.express are ignored
 * @param [opts.express.port=env.PORT || 8080] port to listen to
 * @param [opts.express.sessionSecret=env.SESSION_SECRET || randomly generated]
 *   session secret to use when encrypting sessions
 * @param [opts.express.cookieName=env.COOKIE_NAME || randomly generated] cookie
 *   name to use when identifying this app's session. Must not contain tabs or
 *   spaces
 * @param [opts.express.sessionMins=env.SESSION_MINS || 360] number of minutes
 *   the session should last for
 * @param [opts.express.sessionStore=memory store] express-session store
 * @param [opts.express.preprocessor] function to call after express app
 *   created but before any CACCL routes are added
 * @param [opts.express.postprocessor] function to call after CACCL routes are
 *   added but before the ('*' => react app) route is added. This is great for
 *   adding other server-side routes
 */
const initCACCL = async (
  opts: {
    lti?: {
      installationCredentials: InstallationCredentials,
      initNonceStore?: InitCACCLStore,
      selfLaunch?: SelfLaunchConfig,
      authorizeAfterLaunch?: boolean,
    }
    api?: {
      developerCredentials: DeveloperCredentials,
      initTokenStore?: InitCACCLStore,
      disableClientSideAPI?: boolean,
    },
    express?: {
      app?: express.Application,
      port?: number,
      sessionSecret?: string,
      cookieName?: string,
      sessionMins?: number,
      sessionStore?: SessionStoreType,
      preprocessor?: (app: express.Application) => void,
      postprocessor?: (app: express.Application) => void,
    },
  } = {},
): Promise<void> => {
  /*----------------------------------------*/
  /*                 Express                */
  /*----------------------------------------*/

  // Initialize the express app
  const app = (
    opts?.express?.app
    ?? genExpressApp(opts)
  );

  // Add cross-origin handler for development mode
  if (thisIsDevEnvironment) {
    app.use((req, res, next) => {
      res.setHeader(
        'Access-Control-Allow-Origin',
        'http://localhost:3000',
      );
      res.setHeader(
        'Access-Control-Allow-Methods',
        'PUT, POST, GET, DELETE, OPTIONS',
      );
      res.setHeader(
        'Access-Control-Allow-Credentials',
        'true',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
      );
      res.setHeader(
        'Access-Control-Request-Headers',
        '*',
      );
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });
  }

  // Call express app preprocessor
  const expressAppPreprocessor = opts.express?.preprocessor;
  if (expressAppPreprocessor) {
    expressAppPreprocessor(app);
  }

  /*----------------------------------------*/
  /*               CACCL Libs               */
  /*----------------------------------------*/

  /* --------------- LTI -------------- */

  // Get installation credentials
  let installationCredentials: { [k: string]: string } = (
    thisIsDevEnvironment
      ? { consumer_key: 'consumer_secret' } // Dummy values for Canvas sim
      : (
        // Passed in map
        opts?.lti?.installationCredentials
        // Map from environment
        ?? {
          [process.env.CONSUMER_KEY ?? 'consumer_key']: (
            process.env.CONSUMER_SECRET
            ?? 'consumer_secret'
          ),
        }
      )
  );

  // Initialize LTI
  await initLTI({
    ...(opts?.lti ?? {}),
    app,
    installationCredentials,
  });

  // Store installation credentials for later
  mostRecentInstallationCreds = installationCredentials;

  /* ---------- Auth and API ---------- */

  // By default, auth is disabled
  authDisabled = true;

  // Add auth if we can
  if (
    // Options are passed in
    opts.api
    // Options are in environment
    || (
      process.env.DEFAULT_CANVAS_HOST
      && process.env.CLIENT_ID
      && process.env.CLIENT_SECRET
    )
    // Using development environment fake creds
    || thisIsDevEnvironment
  ) {
    // Get developer credentials
    let developerCredentials: DeveloperCredentials = (
      thisIsDevEnvironment
        ? {
          'localhost:8088': {
            clientId: 'client_id',
            clientSecret: 'client_secret',
          },
        } // Dummy values for Canvas sim
        : (
          // Passed in map
          opts?.api?.developerCredentials
          // Map from environment
          ?? {
            [process.env.DEFAULT_CANVAS_HOST]: {
              clientId: process.env.CLIENT_ID,
              clientSecret: process.env.CLIENT_SECRET,
            },
          }
        )
    );

    // Store state
    authDisabled = false;

    // Initialize auth
    await initAuth({
      ...opts?.api,
      app,
      developerCredentials,
    });

    // Check if client-side API is disabled
    const disableClientSideAPI = !!(opts?.api?.disableClientSideAPI);

    // Initialize auth forwarder
    if (!disableClientSideAPI) {
      // Client-side API is enabled. Add forwarder
      initAPIForwarder({ app });
    }
  }

  /*----------------------------------------*/
  /*          Server-side Endpoints         */
  /*----------------------------------------*/

  /* ------------- Status ------------- */

  /**
   * Get the CACCL status of the current user
   * @author Gabe Abrams
   * @returns success response
   */
  app.get(
    CACCL_PATHS.STATUS,
    async (req, res) => {
      // Get status
      try {
        const status = await getStatus(req);

        // Send status to client
        return res.status(200).json({
          success: true,
          status,
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: (err.message || 'We could not get the current user\'s status.'),
          code: (err.code || ErrorCode.StatusFailed),
        });
      }
    },
  );

  /* --------- Grade Passback --------- */

  /**
   * Handle a client's request to perform grade passback
   * @author Gabe Abrams
   * @param {string} [text] the text of the submission. If this is
   *   included, url cannot be included
   * @param {string} [url] a url to send as the student's submission.
   *   If this is included, text cannot be included
   * @param {number} [score] the student's score on this assignment
   * @param {number} [percent] the student's score as a percent (0-100)
   *   on the assignment
   * @param {string} [submittedAt=now] a timestamp for when the
   *   student submitted the grade. The type must either be an
   *   ISO 8601 formatted string
   */
  app.post(
    CACCL_PATHS.HANDLE_PASSBACK,
    async (req, res) => {
      try {
        // Get info from request body
        const text = (
          req.body.text
            ? String(req.body.text)
            : undefined
        );
        const url = (
          req.body.url
            ? String(req.body.url)
            : undefined
        );
        const score = (
          req.body.score
            ? Number.parseFloat(req.body.score)
            : undefined
        );
        const percent = (
          req.body.percent
            ? Number.parseFloat(req.body.percent)
            : undefined
        );
        const submittedAt = (
          req.body.submittedAt
            ? String(req.body.submittedAt)
            : undefined
        );

        // Call helper
        await handlePassback({
          req,
          text,
          url,
          score,
          percent,
          submittedAt,
        });

        // Send a success response
        return res.status(200).json({
          success: true,
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: (err.message || 'An unknown error occurred while attempting to send a grade passback to Canvas.'),
          code: (err.code || ErrorCode.PassbackUnsuccessful),
        })
      }
    },
  );

  /*----------------------------------------*/
  /*              React Client              */
  /*----------------------------------------*/

  // Run postprocessor first
  if (opts?.express?.postprocessor) {
    opts.express.postprocessor(app);
  }

  // Determine initial working directory
  const initialWorkingDirectory = (
    process.env.PWD.endsWith('/server')
      ? process.env.PWD.substring(0, process.env.PWD.length - '/server'.length)
      : process.env.PWD
  );

  // Change config for dev environment
  if (thisIsDevEnvironment) {
    // Print a notice
    console.log('Server running in development mode. This is not safe for production use.');

    // Redirect all traffic to react development port
    app.get(
      '*',
      (req, res) => {
        // Redirect to the appropriate 
        return res.redirect(`http://localhost:3000${req.path}`);
      },
    );
  } else {
    // This is production! Serve the build directory
    const buildDir = `${initialWorkingDirectory}/client/build`;

    // Serve styles, etc
    app.use(express.static(buildDir));

    // Send frontend
    app.get(
      '*',
      (req, res) => {
        res.sendFile(`${buildDir}/index.html`);
      },
    );
  }

  // Serve the front-end
  if (thisIsDevEnvironment) {
    // This is development! Redirect to front-end hosted at localhost:3000
    app.get('/', (req, res) => {
      return res.redirect('http://localhost:3000');
    });
  } else {
    
  }
};

/*------------------------------------------------------------------------*/
/*                                 Wrap Up                                */
/*------------------------------------------------------------------------*/

export {
  sendRequest,
  getStatus,
  handlePassback,
  getAPI,
  redirectToAuth,
  redirectToSelfLaunch,
};

export default initCACCL;
