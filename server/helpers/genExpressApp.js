"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import libs
var express_1 = __importDefault(require("express"));
var express_session_1 = __importDefault(require("express-session"));
var memorystore_1 = __importDefault(require("memorystore"));
// Check if this is a dev environment
var thisIsDevEnvironment = (process.env.NODE_ENV === 'development');
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
 * @param [opts.express.preprocessor] function to call after express app
 *   created but before any CACCL routes are added
 * @returns initialized express app
 */
var genExpressApp = function (opts) {
    var _a, _b, _c, _d, _e;
    // Get opts
    var port = Number.parseInt(String(((_a = opts.express) === null || _a === void 0 ? void 0 : _a.port)
        || process.env.PORT
        || 8080));
    var sessionSecret = String(((_b = opts.express) === null || _b === void 0 ? void 0 : _b.sessionSecret)
        || process.env.SESSION_SECRET
        || "session-".concat(Date.now(), "-").concat(Math.random(), "-").concat(Math.random()));
    var cookieName = String(((_c = opts.express) === null || _c === void 0 ? void 0 : _c.cookieName)
        || process.env.COOKIE_NAME
        || "CACCL_Canvas_App_".concat(Date.now()).concat(Math.round(Math.random() * 1000000)).concat(Math.round(Math.random() * 1000000)));
    var sessionMins = Number.parseFloat(String(((_d = opts.express) === null || _d === void 0 ? void 0 : _d.sessionMins)
        || process.env.SESSION_MINS
        || 360 // 6 hours
    ));
    var sessionStore = (((_e = opts.express) === null || _e === void 0 ? void 0 : _e.sessionStore)
        || new ((0, memorystore_1.default)(express_session_1.default))({
            checkPeriod: (sessionMins * 60000),
        }));
    // Initialize express
    var app = (0, express_1.default)();
    // Add body parsing
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Create cookie settings
    var cookie = {
        maxAge: (sessionMins * 60000),
    };
    // Add dev settings for cookie
    if (thisIsDevEnvironment) {
        cookie.sameSite = 'none';
        cookie.secure = true;
    }
    // Add express session
    app.use((0, express_session_1.default)({
        cookie: cookie,
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
        var serve = require('caccl-dev-server').default;
        serve({
            app: app,
            port: port,
        });
    }
    else {
        // Start a prod server
        app
            .listen(port, function () {
            console.log("Listening on port: ".concat(port));
        })
            .on('error', function (err) {
            console.log("Could not listen on port: ".concat(port));
            console.log(err);
            process.exit(1);
        });
    }
    // Return the app
    return app;
};
exports.default = genExpressApp;
//# sourceMappingURL=genExpressApp.js.map