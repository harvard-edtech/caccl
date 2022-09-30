import API from 'caccl-api/lib/types/API';
import CACCLStatus from './shared/types/CACCLStatus';
import ClientPassbackRequest from './shared/types/ClientPassbackRequest';
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
declare const sendRequest: (opts: {
    path: string;
    method: ('GET' | 'POST' | 'DELETE' | 'PUT');
    params?: {
        [x: string]: any;
    };
    headers?: {
        [x: string]: any;
    };
    numRetries?: number;
    host?: string;
}) => Promise<{
    body: any;
    status: number;
    headers: {
        [x: string]: any;
    };
}>;
/**
 * Get CACCL status from the server
 * @author Gabe Abrams
 * @returns status
 */
declare const getStatus: () => Promise<CACCLStatus>;
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
declare const handlePassback: (request: ClientPassbackRequest) => Promise<void>;
/**
 * Get a copy of the CACCL API
 * @author Gabe Abrams
 * @param [opts] object containing all arguments
 * @param [opts.numRetries=3] default number of retries per request
 * @param [opts.itemsPerPage=100] default number of items to request
 *   per page
 * @returns CACCL API instance
 */
declare const getAPI: (opts?: {
    numRetries?: number;
    itemsPerPage?: number;
}) => Promise<API>;
/**
 * Redirect the user to the API authorization screen. Useful if the user
 *   is not authorized and you want to be authorized. This is usually
 *   not necessary if lti.authorizeAfterLaunch is set to true when
 *   initializing CACCL on the server. Only functional if Canvas API auth is
 *   enabled via CACCL on the server.
 * @author Gabe Abrams
 */
declare const redirectToAuth: () => void;
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
declare const redirectToSelfLaunch: (opts: {
    courseId: number;
    canvasHost?: string;
    appId?: number;
    selfLaunchState?: any;
}) => void;
/**
 * Init CACCL on the client. This is not necessary in this version of CACCL
 *   but may become necessary in future versions
 * @author Gabe Abrams
 */
declare const initCACCL: () => Promise<void>;
export { sendRequest, getStatus, handlePassback, getAPI, redirectToAuth, redirectToSelfLaunch, };
export default initCACCL;
