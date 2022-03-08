"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectToSelfLaunch = exports.redirectToAuth = exports.getAPI = exports.handlePassback = exports.getStatus = exports.sendRequest = void 0;
// Import caccl libs
var caccl_send_request_1 = __importDefault(require("caccl-send-request"));
var caccl_lti_1 = __importStar(require("caccl-lti"));
var caccl_api_forwarder_1 = __importDefault(require("caccl-api-forwarder"));
var caccl_authorizer_1 = __importStar(require("caccl-authorizer"));
var caccl_api_1 = __importDefault(require("caccl-api"));
var caccl_grade_passback_1 = __importDefault(require("caccl-grade-passback"));
var caccl_error_1 = __importDefault(require("caccl-error"));
var LaunchType_1 = __importDefault(require("caccl-lti/lib/types/LaunchType"));
var ErrorCode_1 = __importDefault(require("./shared/types/ErrorCode"));
// Import shared constants
var CACCL_PATHS_1 = __importDefault(require("./shared/constants/CACCL_PATHS"));
// Import helpers
var genExpressApp_1 = __importDefault(require("./helpers/genExpressApp"));
// Check if this is a dev environment
var thisIsDevEnvironment = (process.env.NODE_ENV === 'development');
/*------------------------------------------------------------------------*/
/*                                 Caching                                */
/*------------------------------------------------------------------------*/
// Store credentials from most recent initialization
var mostRecentInstallationCreds;
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
var sendRequest = function (opts) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, caccl_send_request_1.default)(opts)];
    });
}); };
exports.sendRequest = sendRequest;
/*----------------------------------------*/
/*             Status Checker             */
/*----------------------------------------*/
/**
 * Get CACCL status from the server
 * @author Gabe Abrams
 * @param req express request instance
 * @returns status
 */
var getStatus = function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, launched, launchInfo, authorized, status;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = (0, caccl_lti_1.getLaunchInfo)(req), launched = _a.launched, launchInfo = _a.launchInfo;
                return [4 /*yield*/, (0, caccl_authorizer_1.getAccessToken)(req)];
            case 1:
                authorized = !!(_b.sent());
                if (launched) {
                    status = {
                        launched: launched,
                        launchInfo: launchInfo,
                        authorized: authorized,
                    };
                }
                else {
                    status = {
                        launched: false,
                    };
                }
                // Return status object
                return [2 /*return*/, status];
        }
    });
}); };
exports.getStatus = getStatus;
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
var handlePassback = function (opts) { return __awaiter(void 0, void 0, void 0, function () {
    var req, text, url, score, percent, submittedAt, _a, launched, launchInfo, consumerSecret, success, err_1;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                req = opts.req, text = opts.text, url = opts.url, score = opts.score, percent = opts.percent, submittedAt = opts.submittedAt;
                _a = (0, caccl_lti_1.getLaunchInfo)(req), launched = _a.launched, launchInfo = _a.launchInfo;
                // Make sure the user has a valid session
                if (!launched) {
                    throw new caccl_error_1.default({
                        message: 'You cannot finish this assignment because your session has expired.',
                        code: ErrorCode_1.default.NoLaunchInfo,
                    });
                }
                // Make sure the request contains something to submit
                if (!text && !url) {
                    throw new caccl_error_1.default({
                        message: 'We could not send grades back to Canvas via passback because the request was empty.',
                        code: ErrorCode_1.default.NoPassbackContent,
                    });
                }
                // Make sure we have passback info
                if (launchInfo.launchType !== LaunchType_1.default.Assignment) {
                    throw new caccl_error_1.default({
                        message: 'We could not send grades back to Canvas via passback because we don\'t have a valid Canvas LTI assignment launch.',
                        code: ErrorCode_1.default.NoAssignmentLaunch,
                    });
                }
                if (!((_b = launchInfo.outcome) === null || _b === void 0 ? void 0 : _b.sourcedId)
                    || !((_c = launchInfo.outcome) === null || _c === void 0 ? void 0 : _c.url)) {
                    throw new caccl_error_1.default({
                        message: 'We could not send grades back to Canvas via passback because we don\'t have the information from Canvas to send the request.',
                        code: ErrorCode_1.default.NoOutcomeInfo,
                    });
                }
                // Make sure Canvas can accept the request
                if ((url && !launchInfo.outcome.urlSubmissionAccepted)
                    || (text && !launchInfo.outcome.textSubmissionAccepted)
                    || (score && !launchInfo.outcome.totalScoreAccepted)
                    || (submittedAt && !launchInfo.outcome.submittedAtAccepted)) {
                    // Canvas cannot accept our request
                    throw new caccl_error_1.default({
                        message: 'We could not send grades back to Canvas via passback because Canvas does not support all of the parameters we want to send.',
                        code: ErrorCode_1.default.PassbackParamNotAccepted,
                    });
                }
                // Make sure we have credentials
                if (!mostRecentInstallationCreds) {
                    throw new caccl_error_1.default({
                        message: 'We could not send grades back to Canvas via passback because CACCL is not yet initialized.',
                        code: ErrorCode_1.default.PassbackBeforeCACCLInitialized,
                    });
                }
                consumerSecret = mostRecentInstallationCreds[launchInfo.consumerKey];
                if (!consumerSecret) {
                    throw new caccl_error_1.default({
                        message: 'We could not send grades back to Canvas via passback because this app is not set up to be installed for this Canvas host.',
                        code: ErrorCode_1.default.PassbackParamNotAccepted,
                    });
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, caccl_grade_passback_1.default)({
                        request: {
                            text: text,
                            url: url,
                            score: score,
                            percent: percent,
                            submittedAt: (submittedAt || (new Date()).toISOString()),
                        },
                        info: {
                            sourcedId: launchInfo.outcome.sourcedId,
                            url: launchInfo.outcome.url,
                        },
                        credentials: {
                            consumerKey: launchInfo.consumerKey,
                            consumerSecret: consumerSecret,
                        },
                    })];
            case 2:
                success = _d.sent();
                // Force failure if handlePassback fails
                if (!success) {
                    throw new Error();
                }
                return [3 /*break*/, 4];
            case 3:
                err_1 = _d.sent();
                throw new caccl_error_1.default({
                    message: 'We could not send grades back to Canvas via passback because Canvas did not accept the appropriate updates.',
                    code: ErrorCode_1.default.PassbackUnsuccessful,
                });
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.handlePassback = handlePassback;
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
var getAPI = function (opts) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, launched, launchInfo, accessToken;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = (0, caccl_lti_1.getLaunchInfo)(opts.req), launched = _a.launched, launchInfo = _a.launchInfo;
                if (!launched || !launchInfo.canvasHost) {
                    throw new caccl_error_1.default({
                        message: 'We could not get a copy of the CACCL API because the current user has not launched via LTI.',
                        code: ErrorCode_1.default.CantInitAPIWithoutLaunch,
                    });
                }
                return [4 /*yield*/, (0, caccl_authorizer_1.getAccessToken)(opts.req)];
            case 1:
                accessToken = _b.sent();
                if (!accessToken) {
                    throw new caccl_error_1.default({
                        message: 'We could not get a copy of the CACCL API because the current user is not authorized with Canvas.',
                        code: ErrorCode_1.default.CantInitAPIWithoutAuth,
                    });
                }
                // Initialize the API instance
                return [2 /*return*/, (0, caccl_api_1.default)({
                        numRetries: opts.numRetries,
                        itemsPerPage: opts.itemsPerPage,
                        canvasHost: launchInfo.canvasHost,
                        defaultCourseId: launchInfo.courseId,
                        accessToken: accessToken,
                    })];
        }
    });
}); };
exports.getAPI = getAPI;
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
var redirectToAuth = function (res) {
    return res.redirect(CACCL_PATHS_1.default.AUTHORIZE);
};
exports.redirectToAuth = redirectToAuth;
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
var redirectToSelfLaunch = function (opts) {
    return opts.res.redirect((0, caccl_lti_1.getSelfLaunchURL)(opts));
};
exports.redirectToSelfLaunch = redirectToSelfLaunch;
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
 *   name to use when identifying this app's session
 * @param [opts.express.sessionMins=env.SESSION_MINS || 360] number of minutes
 *   the session should last for
 * @param [opts.express.sessionStore=memory store] express-session store
 * @param [opts.express.preprocessor] function to call after express app
 *   created but before any CACCL routes are added
 */
var initCACCL = function (opts) { return __awaiter(void 0, void 0, void 0, function () {
    var app, expressAppPreprocessor, installationCredentials, developerCredentials, disableClientSideAPI;
    var _a, _b;
    var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    return __generator(this, function (_p) {
        switch (_p.label) {
            case 0:
                app = ((_d = (_c = opts === null || opts === void 0 ? void 0 : opts.express) === null || _c === void 0 ? void 0 : _c.app) !== null && _d !== void 0 ? _d : (0, genExpressApp_1.default)(opts));
                expressAppPreprocessor = (_e = opts.express) === null || _e === void 0 ? void 0 : _e.preprocessor;
                if (expressAppPreprocessor) {
                    expressAppPreprocessor(app);
                }
                installationCredentials = (thisIsDevEnvironment
                    ? { consumer_key: 'consumer_secret' } // Dummy values for Canvas sim
                    : (
                    // Passed in map
                    (_g = (_f = opts === null || opts === void 0 ? void 0 : opts.lti) === null || _f === void 0 ? void 0 : _f.installationCredentials) !== null && _g !== void 0 ? _g : (_a = {},
                        _a[(_h = process.env.CONSUMER_KEY) !== null && _h !== void 0 ? _h : 'consumer_key'] = ((_j = process.env.CONSUMER_SECRET) !== null && _j !== void 0 ? _j : 'consumer_secret'),
                        _a)));
                // Initialize LTI
                return [4 /*yield*/, (0, caccl_lti_1.default)(__assign(__assign({}, ((_k = opts === null || opts === void 0 ? void 0 : opts.lti) !== null && _k !== void 0 ? _k : {})), { app: app, installationCredentials: installationCredentials }))];
            case 1:
                // Initialize LTI
                _p.sent();
                // Store installation credentials for later
                mostRecentInstallationCreds = installationCredentials;
                if (!(opts === null || opts === void 0 ? void 0 : opts.api)) return [3 /*break*/, 3];
                developerCredentials = (thisIsDevEnvironment
                    ? {
                        'localhost:8088': {
                            clientId: 'client_id',
                            clientSecret: 'client_secret',
                        },
                    } // Dummy values for Canvas sim
                    : (
                    // Passed in map
                    (_m = (_l = opts === null || opts === void 0 ? void 0 : opts.api) === null || _l === void 0 ? void 0 : _l.developerCredentials) !== null && _m !== void 0 ? _m : (_b = {},
                        _b[process.env.DEFAULT_CANVAS_HOST] = {
                            clientId: process.env.CLIENT_ID,
                            clientSecret: process.env.CLIENT_SECRET,
                        },
                        _b)));
                // Initialize auth
                return [4 /*yield*/, (0, caccl_authorizer_1.default)(__assign(__assign({}, opts === null || opts === void 0 ? void 0 : opts.api), { app: app, developerCredentials: developerCredentials }))];
            case 2:
                // Initialize auth
                _p.sent();
                disableClientSideAPI = !!((_o = opts === null || opts === void 0 ? void 0 : opts.api) === null || _o === void 0 ? void 0 : _o.disableClientSideAPI);
                // Initialize auth forwarder
                if (!disableClientSideAPI) {
                    // Client-side API is enabled. Add forwarder
                    (0, caccl_api_forwarder_1.default)({ app: app });
                }
                _p.label = 3;
            case 3:
                /*----------------------------------------*/
                /*          Server-side Endpoints         */
                /*----------------------------------------*/
                /* ------------- Status ------------- */
                /**
                 * Get the CACCL status of the current user
                 * @author Gabe Abrams
                 * @returns success response
                 */
                app.get(CACCL_PATHS_1.default.STATUS, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var status_1, err_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, getStatus(req)];
                            case 1:
                                status_1 = _a.sent();
                                // Send status to client
                                return [2 /*return*/, res.status(200).json({
                                        success: true,
                                        status: status_1,
                                    })];
                            case 2:
                                err_2 = _a.sent();
                                return [2 /*return*/, res.status(500).json({
                                        success: false,
                                        message: (err_2.message || 'We could not get the current user\'s status.'),
                                        code: (err_2.code || ErrorCode_1.default.StatusFailed),
                                    })];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
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
                app.post(CACCL_PATHS_1.default.HANDLE_PASSBACK, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var text, url, score, percent, submittedAt, err_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                text = (req.body.text
                                    ? String(req.body.text)
                                    : undefined);
                                url = (req.body.url
                                    ? String(req.body.url)
                                    : undefined);
                                score = (req.body.score
                                    ? Number.parseFloat(req.body.score)
                                    : undefined);
                                percent = (req.body.percent
                                    ? Number.parseFloat(req.body.percent)
                                    : undefined);
                                submittedAt = (req.body.submittedAt
                                    ? String(req.body.submittedAt)
                                    : undefined);
                                // Call helper
                                return [4 /*yield*/, handlePassback({
                                        req: req,
                                        text: text,
                                        url: url,
                                        score: score,
                                        percent: percent,
                                        submittedAt: submittedAt,
                                    })];
                            case 1:
                                // Call helper
                                _a.sent();
                                // Send a success response
                                return [2 /*return*/, res.status(200).json({
                                        success: true,
                                    })];
                            case 2:
                                err_3 = _a.sent();
                                return [2 /*return*/, res.status(500).json({
                                        success: false,
                                        message: (err_3.message || 'An unknown error occurred while attempting to send a grade passback to Canvas.'),
                                        code: (err_3.code || ErrorCode_1.default.PassbackUnsuccessful),
                                    })];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); };
exports.default = initCACCL;
//# sourceMappingURL=index.js.map