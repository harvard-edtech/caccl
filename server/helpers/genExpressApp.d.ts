import express from 'express';
import { Store as SessionStoreType } from 'express-session';
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
declare const genExpressApp: (opts: {
    express?: {
        app?: express.Application;
        port?: number;
        sessionSecret?: string;
        cookieName?: string;
        sessionMins?: number;
        sessionStore?: SessionStoreType;
        preprocessor?: (app: express.Application) => void;
    };
}) => express.Application;
export default genExpressApp;
