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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectToSelfLaunch = exports.redirectToAuth = exports.getAPI = exports.handlePassback = exports.getStatus = exports.sendRequest = void 0;
// Import caccl libs
var caccl_error_1 = __importDefault(require("caccl-error"));
var caccl_send_request_1 = __importDefault(require("caccl-send-request"));
var caccl_lti_1 = require("caccl-lti");
var caccl_api_1 = __importDefault(require("caccl-api"));
// Import shared types
var ErrorCode_1 = __importDefault(require("./shared/types/ErrorCode"));
// Import shared constants
var CACCL_PATHS_1 = __importDefault(require("./shared/constants/CACCL_PATHS"));
var COURSE_ID_REPLACE_WITH_CURR_1 = __importDefault(require("./shared/constants/COURSE_ID_REPLACE_WITH_CURR"));
var CACCL_SIM_TOOL_ID_1 = __importDefault(require("./shared/constants/CACCL_SIM_TOOL_ID"));
// Check if this is a dev environment
var thisIsDevEnvironment = (((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.hostname) === 'localhost');
// Get the server's hostname
var serverHost = (thisIsDevEnvironment
    ? 'localhost:8080'
    : window.location.hostname);
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
var sendRequest = function (opts) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        return [2 /*return*/, (0, caccl_send_request_1.default)(__assign(__assign({}, opts), { host: ((_a = opts.host) !== null && _a !== void 0 ? _a : serverHost) }))];
    });
}); };
exports.sendRequest = sendRequest;
/*----------------------------------------*/
/*             Status Checker             */
/*----------------------------------------*/
/**
 * Get CACCL status from the server
 * @author Gabe Abrams
 * @returns status
 */
var getStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
    var body, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, sendRequest({
                        path: CACCL_PATHS_1.default.STATUS,
                        method: 'GET',
                    })];
            case 1:
                // Send request to server
                (body = (_a.sent()).body);
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                throw new caccl_error_1.default({
                    message: "We could not get your Canvas status because an error occurred: ".concat(err_1.message || 'unknown error'),
                    code: ErrorCode_1.default.StatusUnavailable,
                });
            case 3:
                // Parse request
                if (body.success && body.status) {
                    return [2 /*return*/, body.status];
                }
                // Invalid request! Throw as error
                throw new caccl_error_1.default({
                    message: body.message,
                    code: body.code,
                });
        }
    });
}); };
exports.getStatus = getStatus;
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
var handlePassback = function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var body, success, message, code;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, sendRequest({
                    path: CACCL_PATHS_1.default.HANDLE_PASSBACK,
                    method: 'POST',
                    params: __assign(__assign({}, request), { submittedAt: (typeof request.submittedAt === 'string'
                            ? request.submittedAt
                            : request.submittedAt.toISOString()) }),
                })];
            case 1:
                body = (_a.sent()).body;
                success = body.success, message = body.message, code = body.code;
                // Throw any error that occurred
                if (!success) {
                    throw new caccl_error_1.default({
                        message: message,
                        code: code,
                    });
                }
                return [2 /*return*/];
        }
    });
}); };
exports.handlePassback = handlePassback;
/*----------------------------------------*/
/*                   API                  */
/*----------------------------------------*/
// Cached copies of the CACCL API instance
var cachedAPIs = new Map(); // jsonified apiOpts => API instance
/**
 * Get a copy of the CACCL API
 * @author Gabe Abrams
 * @param [opts] object containing all arguments
 * @param [opts.numRetries=3] default number of retries per request
 * @param [opts.itemsPerPage=100] default number of items to request
 *   per page
 * @returns CACCL API instance
 */
var getAPI = function (opts) {
    if (opts === void 0) { opts = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var cacheKey, api;
        return __generator(this, function (_a) {
            cacheKey = JSON.stringify(opts);
            api = cachedAPIs.get(cacheKey);
            // Finish if we found a cached version of the API
            if (api) {
                return [2 /*return*/, api];
            }
            // Create a new instance (no cached version)
            api = (0, caccl_api_1.default)({
                numRetries: opts.numRetries,
                itemsPerPage: opts.itemsPerPage,
                canvasHost: serverHost,
                pathPrefix: CACCL_PATHS_1.default.FORWARDER_PREFIX,
                defaultCourseId: COURSE_ID_REPLACE_WITH_CURR_1.default,
            });
            // Store in cache
            cachedAPIs.set(cacheKey, api);
            // Return new api instance
            return [2 /*return*/, api];
        });
    });
};
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
 */
var redirectToAuth = function () {
    window.location.href = (thisIsDevEnvironment
        ? "https://localhost:8080".concat(CACCL_PATHS_1.default.AUTHORIZE)
        : CACCL_PATHS_1.default.AUTHORIZE);
};
exports.redirectToAuth = redirectToAuth;
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
var redirectToSelfLaunch = function (opts) {
    // Get the path of the self launch page
    var path = (0, caccl_lti_1.getSelfLaunchURL)(__assign(__assign({}, opts), { appId: (thisIsDevEnvironment
            ? CACCL_SIM_TOOL_ID_1.default
            : opts.appId) }));
    // Redirect to the appropriate path
    window.location.href = (thisIsDevEnvironment
        ? "https://localhost:8080".concat(path)
        : path);
};
exports.redirectToSelfLaunch = redirectToSelfLaunch;
/*------------------------------------------------------------------------*/
/*                               Initializer                              */
/*------------------------------------------------------------------------*/
/**
 * Init CACCL on the client. This is not necessary in this version of CACCL
 *   but may become necessary in future versions
 * @author Gabe Abrams
 */
var initCACCL = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/];
}); }); };
exports.default = initCACCL;
//# sourceMappingURL=index.js.map