import express from 'express';
import { Store as SessionStoreType } from 'express-session';
import InitCACCLStore from 'caccl-memory-store/lib/InitCACCLStore';
import API from 'caccl-api/lib/types/API';
import DeveloperCredentials from 'caccl-authorizer/lib/shared/types/DeveloperCredentials';
import InstallationCredentials from 'caccl-lti/lib/shared/types/InstallationCredentials';
import SelfLaunchConfig from 'caccl-lti/lib/shared/types/SelfLaunchConfig';
import CACCLStatus from './shared/types/CACCLStatus';
import ServerPassbackRequest from './shared/types/ServerPassbackRequest';
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
declare const sendRequest: (opts: {
    host: string;
    path: string;
    method: ('GET' | 'POST' | 'DELETE' | 'PUT');
    params?: {
        [x: string]: any;
    };
    headers?: {
        [x: string]: any;
    };
    numRetries?: number;
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
 * @param req express request instance
 * @returns status
 */
declare const getStatus: (req: express.Request) => Promise<CACCLStatus>;
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
declare const handlePassback: (opts: ServerPassbackRequest) => Promise<void>;
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
declare const getAPI: (opts: {
    req: express.Request;
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
 * @param res express response object
 */
declare const redirectToAuth: (res: express.Response) => void;
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
declare const redirectToSelfLaunch: (opts: {
    res: express.Response;
    courseId: number;
    canvasHost?: string;
    appId?: number;
    selfLaunchState?: any;
}) => void;
/**
 * Initialize a CACCL app server
 * @author Gabe Abrams
 * @param [opts] object containing all arguments
 * @param [opts.lti] object containing all LTI configuration params
 * @param [opts.lti.installationCredentials=env vars] an object where keys are
 *   LTI consumer keys and values are LTI shared secrets. If excluded, defaults
 *   to { [env.CONSUMER_KEY | 'consumer_key']: (env.CONSUMER_SECRET | 'consumer_secret') }
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
 * @param [opts.lti.selfLaunch.defaultCanvasHost=env.DEFAULT_CANVAS_HOST] default Canvas host to use in
 *   self launches
 * @param [opts.api] object containing all api and authorization configuration
 *   params. Must be included if integrating with the Canvas API
 * @param [opts.api.developerCredentials] map of developer credentials
 *   to use when authorizing this app with canvas. If excluded, defaults to
 *   { [env.DEFAULT_CANVAS_HOST]: { [env..CLIENT_ID]: env..CLIENT_SECRET } }
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
declare const initCACCL: (opts?: {
    lti?: {
        installationCredentials?: InstallationCredentials;
        initNonceStore?: InitCACCLStore;
        selfLaunch?: SelfLaunchConfig;
        authorizeAfterLaunch?: boolean;
    };
    api?: {
        developerCredentials?: DeveloperCredentials;
        initTokenStore?: InitCACCLStore;
        disableClientSideAPI?: boolean;
    };
    express?: {
        app?: express.Application;
        port?: number;
        sessionSecret?: string;
        cookieName?: string;
        sessionMins?: number;
        sessionStore?: SessionStoreType;
        preprocessor?: (app: express.Application) => void;
        postprocessor?: (app: express.Application) => void;
    };
}) => Promise<void>;
export { sendRequest, getStatus, handlePassback, getAPI, redirectToAuth, redirectToSelfLaunch, };
export default initCACCL;
