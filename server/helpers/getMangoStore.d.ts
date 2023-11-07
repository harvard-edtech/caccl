import { Store as SessionStoreType } from 'express-session';
import SessionCollection from '../shared/types/SessionCollection';
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
declare const getMangoStore: (opts: {
    sessionCollection: SessionCollection;
    sessionMins: number;
    minSessionVersion: string;
}) => SessionStoreType;
export default getMangoStore;
