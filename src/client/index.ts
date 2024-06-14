// Import caccl libs
import CACCLError from 'caccl-error';
import cacclSendRequest from 'caccl-send-request';
import { getSelfLaunchURL } from 'caccl-lti';
import initAPI from 'caccl-api';
import API from 'caccl-api/lib/types/API';

// Import shared types
import ErrorCode from './shared/types/ErrorCode';
import CACCLStatus from './shared/types/CACCLStatus';
import ClientPassbackRequest from './shared/types/ClientPassbackRequest';

// Import shared constants
import CACCL_PATHS from './shared/constants/CACCL_PATHS';
import COURSE_ID_REPLACE_WITH_CURR from './shared/constants/COURSE_ID_REPLACE_WITH_CURR';
import CACCL_SIM_TOOL_ID from './shared/constants/CACCL_SIM_TOOL_ID';

// Check if this is a dev environment
const thisIsDevEnvironment = (window?.location?.hostname === 'localhost');

// Get the server's hostname
const serverHost = (
  thisIsDevEnvironment
    ? 'localhost:8080'
    : window.location.hostname
);

/*------------------------------------------------------------------------*/
/*                                Functions                               */
/*------------------------------------------------------------------------*/

/*----------------------------------------*/
/*             Request Sender             */
/*----------------------------------------*/

/**
 * Send a request to the server
 * @author Gabe Abrams
 * @param opts object containing all arguments
 * @param opts.path path of the server endpoint
 * @param opts.method http method of the request
 * @param [opts.params] object containing body/query parameters. Only allows
 *   one level of object nesting (values that are objects must be stringified
 *   using JSON.stringify and then parsed on the server)
 * @param [opts.header] object containing additional headers to include
 * @param [opts.host=server host] custom hostname to send requests to
 *   (if not the caccl-defined server host)
 * @param [opts.numRetries=3] number of times to retry the request if a network
 *   error occurs
 * @returns response object
 */
const sendRequest = async (
  opts: {
    path: string,
    method: ('GET' | 'POST' | 'DELETE' | 'PUT'),
    params?: { [k in string]: any },
    headers?: { [k in string]: any },
    numRetries?: number,
    host?: string,
  },
): Promise<{
  body: any,
  status: number,
  headers: { [k in string]: any },
}> => {
  return cacclSendRequest({
    ...opts,
    host: (opts.host ?? serverHost),
  });
};

/*----------------------------------------*/
/*             Status Checker             */
/*----------------------------------------*/

/**
 * Get CACCL status from the server
 * @author Gabe Abrams
 * @returns status
 */
const getStatus = async (): Promise<CACCLStatus> => {
  let body: {
    success: boolean,
    status?: CACCLStatus,
    message?: string,
    code?: string,
  };
  try {
    // Send request to server
    ({ body } = await sendRequest({
      path: CACCL_PATHS.STATUS,
      method: 'GET',
    }));
  } catch (err) {
    throw new CACCLError({
      message: `We could not get your Canvas status because an error occurred: ${err.message || 'unknown error'}`,
      code: ErrorCode.StatusUnavailable,
    });
  }

  // Parse request
  if (body.success && body.status) {
    return body.status;
  }

  // Invalid request! Throw as error
  throw new CACCLError({
    message: body.message,
    code: body.code,
  });
};

/*----------------------------------------*/
/*             Grade Passback             */
/*----------------------------------------*/

/**
 * Send grade passback via the server. If the server has turned off
 *   client-side grade passback, or if the current user didn't launch through
 *   an external assignment, this action will fail.
 * @author Gabe Abrams
 * @param {object} request - an object containing all the information for
 *   the passback request
 * @param {string} [request.text] - the text of the submission. If this is
 *   included, url cannot be included
 * @param {string} [request.url] - a url to send as the student's
 *   submission. If this is included, text cannot be included
 * @param {number} [request.score] - the student's score on this assignment
 * @param {number} [request.percent] - the student's score as a percent
 *   (0-100) on the assignment
 * @param {Date|string} [request.submittedAt=now] - a timestamp for when the
 *   student submitted the grade. The type must either be a Date object or
 *   an ISO 8601 formatted string
 */
const handlePassback = async (request: ClientPassbackRequest) => {
  const { body } = await sendRequest({
    path: CACCL_PATHS.HANDLE_PASSBACK,
    method: 'POST',
    params: {
      ...request,
      submittedAt: (
        typeof request.submittedAt === 'string'
          ? request.submittedAt
          : (request.submittedAt as any).toISOString()
      ),
    },
  });

  // Parse body
  const {
    success,
    message,
    code,
  } = body;

  // Throw any error that occurred
  if (!success) {
    throw new CACCLError({
      message,
      code,
    });
  }
};

/*----------------------------------------*/
/*                   API                  */
/*----------------------------------------*/

// Cached copies of the CACCL API instance
const cachedAPIs = new Map<string,API>(); // jsonified apiOpts => API instance

/**
 * Get a copy of the CACCL API
 * @author Gabe Abrams
 * @param [opts] object containing all arguments
 * @param [opts.numRetries=3] default number of retries per request
 * @param [opts.itemsPerPage=100] default number of items to request
 *   per page
 * @returns CACCL API instance
 */
const getAPI = async (
  opts: {
    numRetries?: number,
    itemsPerPage?: number,
  } = {},
): Promise<API> => {
  // Look up in cache
  const cacheKey = JSON.stringify(opts);
  let api: (API | undefined) = cachedAPIs.get(cacheKey);

  // Finish if we found a cached version of the API
  if (api) {
    return api;
  }

  // Create a new instance (no cached version)
  api = initAPI({
    numRetries: opts.numRetries,
    itemsPerPage: opts.itemsPerPage,
    canvasHost: serverHost,
    pathPrefix: CACCL_PATHS.FORWARDER_PREFIX,
    defaultCourseId: COURSE_ID_REPLACE_WITH_CURR,
  });

  // Store in cache
  cachedAPIs.set(cacheKey, api);

  // Return new api instance
  return api;
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
 */
const redirectToAuth = () => {
  window.location.href = (
    thisIsDevEnvironment
      ? `https://localhost:8080${CACCL_PATHS.AUTHORIZE}`
      : CACCL_PATHS.AUTHORIZE
  );
};

/**
 * Redirect the user to the self-launch process. Only functional if
 *   self-launch is enabled via CACCL on the server.
 * @author Gabe Abrams
 * @param opts object containing all arguments
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
    courseId: number,
    canvasHost?: string,
    appId?: number,
    selfLaunchState?: any,
  },
) => {
  // Get the path of the self launch page
  const path = getSelfLaunchURL({
    ...opts,
    appId: (
      thisIsDevEnvironment
        ? CACCL_SIM_TOOL_ID
        : opts.appId
    ),
  });

  // Redirect to the appropriate path
  window.location.href = (
    thisIsDevEnvironment
      ? `https://localhost:8080${path}`
      : path
  );
};

/*------------------------------------------------------------------------*/
/*                               Initializer                              */
/*------------------------------------------------------------------------*/

/**
 * Init CACCL on the client. This is not necessary in this version of CACCL
 *   but may become necessary in future versions
 * @author Gabe Abrams
 */
const initCACCL = async () => {};

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
