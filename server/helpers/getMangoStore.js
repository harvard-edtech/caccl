"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
// Import Express Session
var express_session_1 = require("express-session");
// Import other libs
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
// Get the current version number
var projectRootDir = (process.env.PWD || __dirname);
var packageJSONContents = fs_1.default.readFileSync(path_1.default.join(projectRootDir, 'package.json'), 'utf-8');
var packageJSON = JSON.parse(packageJSONContents);
var currVersion = packageJSON.version;
/**
 * Check if a version number is allowed given the current minimum version
 * @author Gabe Abrams
 * @param minVersion the minimum version to allow
 * @param currVersion the current version
 * @returns true if the current version is allowed
 */
var checkVersion = function (minVersion, currVersion) {
    var minVersionParts = minVersion.split('.').map(function (part) {
        return Number.parseInt(part, 10);
    });
    var currVersionParts = currVersion.split('.').map(function (part) {
        return Number.parseInt(part, 10);
    });
    if (currVersionParts[0] >= minVersionParts[0]) {
        return true;
    }
    if (currVersionParts[1] >= minVersionParts[1]) {
        return true;
    }
    return (currVersionParts[2] >= minVersionParts[2]);
};
/**
 * Get an initialized copy of a dce-mango based session store
 * @author Gabe Abrams
 * @param opts object containing all arguments
 * @param opts.sessionCollection initialized mango collection that stores object of type CACCLSessionItem
 * @param opts.sessionMins number of minutes
 *   the session should last for
 * @param opts.minSessionVersion only relevant if
 *   using a sessionCollection. This version number is the minimum app version number
 *   (from the top-level package.json) that will be allowed for user sessions. If a
 *   user's session was initialized while the app's version number was older than this
 *   value, the user's session will be destroyed
 * @returns MangoStore class (not instantiated)
 */
var getMangoStore = function (opts) {
    // Destructure opts
    var sessionCollection = opts.sessionCollection, sessionMins = opts.sessionMins, minSessionVersion = opts.minSessionVersion;
    // Initialize the session store
    var MangoStore = /** @class */ (function (_super) {
        __extends(MangoStore, _super);
        function MangoStore() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Get a user's session
         * @author Gabe Abrams
         * @param sid user's current session id
         * @param callback session callback function (called with session data or error)
         */
        MangoStore.prototype.get = function (sid, callback) {
            var _this = this;
            // Wrap in asynchronous function
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var results, sessionItem, expiryTimestamp, versionRecentEnough;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sessionCollection.find({ sid: sid })];
                        case 1:
                            results = _a.sent();
                            if (results.length === 0) {
                                return [2 /*return*/, null];
                            }
                            sessionItem = results[0];
                            expiryTimestamp = (sessionItem.timestamp + (sessionMins * 60000));
                            if (!(expiryTimestamp < Date.now())) return [3 /*break*/, 3];
                            // Expired
                            // Clean up expired session
                            return [4 /*yield*/, sessionCollection.delete({ sid: sid })];
                        case 2:
                            // Expired
                            // Clean up expired session
                            _a.sent();
                            // Return null session
                            return [2 /*return*/, null];
                        case 3:
                            versionRecentEnough = checkVersion(minSessionVersion, sessionItem.appVersion);
                            if (!!versionRecentEnough) return [3 /*break*/, 5];
                            // Not recent enough
                            // Clean up old session
                            return [4 /*yield*/, sessionCollection.delete({ sid: sid })];
                        case 4:
                            // Not recent enough
                            // Clean up old session
                            _a.sent();
                            // Return null session
                            return [2 /*return*/, null];
                        case 5: 
                        // Valid session! Return it
                        return [2 /*return*/, sessionItem.sessionData];
                    }
                });
            }); })()
                .then(function (result) {
                return callback(null, result);
            })
                .catch(function (err) {
                return callback(err);
            });
        };
        /**
         * Initialize or update a user's session
         * @author Gabe Abrams
         * @param sid the user's session id
         * @param session the session data to store
         * @param callback session callback function (called with error)
         */
        MangoStore.prototype.set = function (sid, session, callback) {
            var _this = this;
            // Wrap in asynchronous function
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var item;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            item = {
                                sid: sid,
                                sessionData: session,
                                appVersion: currVersion,
                                timestamp: Date.now(),
                            };
                            // Insert
                            return [4 /*yield*/, sessionCollection.insert(item)];
                        case 1:
                            // Insert
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); })()
                .catch(function (err) {
                if (callback) {
                    return callback(err);
                }
            });
        };
        /**
         * Destroy a user's session
         * @author Gabe Abrams
         * @param sid the user's session id
         * @param callback session callback function (called with error)
         */
        MangoStore.prototype.destroy = function (sid, callback) {
            var _this = this;
            // Wrap in asynchronous function
            (function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: 
                        // Destroy session
                        return [4 /*yield*/, sessionCollection.delete({ sid: sid })];
                        case 1:
                            // Destroy session
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); })()
                .catch(function (err) {
                if (callback) {
                    return callback(err);
                }
            });
        };
        /**
         * Get all sessions
         * @author Gabe Abrams
         * @param callback session callback function (called with all session datas or error)
         */
        MangoStore.prototype.all = function (callback) {
            var _this = this;
            // Wrap in asynchronous function
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sessionCollection.find({})];
                        case 1:
                            results = _a.sent();
                            return [2 /*return*/, results.map(function (result) {
                                    return result.sessionData;
                                })];
                    }
                });
            }); })()
                .then(function (results) {
                return callback(null, results);
            })
                .catch(function (err) {
                return callback(err);
            });
        };
        /**
         * Count the number of sessions
         * @author Gabe Abrams
         * @param callback session callback function (called with all session datas or error)
         */
        MangoStore.prototype.length = function (callback) {
            var _this = this;
            // Wrap in asynchronous function
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, sessionCollection.find({})];
                        case 1:
                            results = _a.sent();
                            return [2 /*return*/, results.length];
                    }
                });
            }); })()
                .then(function (num) {
                return callback(null, num);
            })
                .catch(function (err) {
                return callback(err);
            });
        };
        /**
         * Touch a session to reset its expiry
         * @param sid the user's session id
         * @param session updated session data
         * @param callback callback to call when finished
         */
        MangoStore.prototype.touch = function (sid, session, callback) {
            var _this = this;
            // Wrap in asynchronous function
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var item;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            item = {
                                sid: sid,
                                sessionData: session,
                                appVersion: currVersion,
                                timestamp: Date.now(),
                            };
                            // Insert
                            return [4 /*yield*/, sessionCollection.insert(item)];
                        case 1:
                            // Insert
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); })()
                .then(callback);
        };
        return MangoStore;
    }(express_session_1.Store));
    return new MangoStore();
};
exports.default = getMangoStore;
//# sourceMappingURL=getMangoStore.js.map