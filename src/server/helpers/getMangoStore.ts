// Import Express Session
import { Store as SessionStoreType, SessionData as SessionDataType } from 'express-session';

// Import other libs
import path from 'path';
import fs from 'fs';

// Import shared types
import CACCLSessionItem from '../shared/types/CACCLSessionItem';
import SessionCollection from '../shared/types/SessionCollection';

// Get the current version number
const projectRootDir = (process.env.PWD || __dirname);
const packageJSONContents = fs.readFileSync(
  path.join(projectRootDir, 'package.json'),
  'utf-8',
);
const packageJSON = JSON.parse(packageJSONContents);
const currVersion = packageJSON.version;

/**
 * Check if a version number is allowed given the current minimum version
 * @author Gabe Abrams
 * @param minVersion the minimum version to allow
 * @param currVersion the current version
 * @returns true if the current version is allowed
 */
const checkVersion = (minVersion: string, currVersion: string): boolean => {
  const minVersionParts = minVersion.split('.').map((part) => {
    return Number.parseInt(part, 10);
  });
  
  const currVersionParts = currVersion.split('.').map((part) => {
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
const getMangoStore = (
  opts: {
    sessionCollection: SessionCollection,
    sessionMins: number,
    minSessionVersion: string,
  },
): SessionStoreType => {
  // Destructure opts
  const {
    sessionCollection,
    sessionMins,
    minSessionVersion,
  } = opts;
  
  // Initialize the session store
  class MangoStore extends SessionStoreType {
    /**
     * Get a user's session
     * @author Gabe Abrams
     * @param sid user's current session id
     * @param callback session callback function (called with session data or error)
     */
    public get(sid: string, callback: (err: any, session?: SessionDataType | null) => void): void {
      // Wrap in asynchronous function
      (async () => {
        // Look up the user's session
        const results = await sessionCollection.find({ sid });
        if (results.length === 0) {
          return null;
        }
        const sessionItem: CACCLSessionItem = results[0];

        // Clean up if session expired
        const expiryTimestamp = (sessionItem.timestamp + (sessionMins * 60000));
        if (expiryTimestamp < Date.now()) {
          // Expired
          // Clean up expired session
          await sessionCollection.delete({ sid });
          // Return null session
          return null;
        }

        // Validate version
        const versionRecentEnough = checkVersion(minSessionVersion, sessionItem.appVersion);
        if (!versionRecentEnough) {
          // Not recent enough
          // Clean up old session
          await sessionCollection.delete({ sid });
          // Return null session
          return null;
        }

        // Valid session! Return it
        return sessionItem.sessionData;
      })()
        .then((result: SessionDataType | null) => {
          return callback(null, result);
        })
        .catch((err) => {
          return callback(err);
        });
    }

    /**
     * Initialize or update a user's session
     * @author Gabe Abrams
     * @param sid the user's session id
     * @param session the session data to store
     * @param callback session callback function (called with error)
     */
    public set(sid: string, session: SessionDataType, callback?: (err?: any) => void): void {
      // Wrap in asynchronous function
      (async () => {
        // Create a session item
        const item: CACCLSessionItem = {
          sid,
          sessionData: session,
          appVersion: currVersion,
          timestamp: Date.now(),
        };

        // Insert
        await sessionCollection.insert(item);
      })()
        .then(callback)
        .catch((err) => {
          if (callback) {
            return callback(err);
          }
        });
    }

    /**
     * Destroy a user's session
     * @author Gabe Abrams
     * @param sid the user's session id
     * @param callback session callback function (called with error)
     */
    public destroy(sid: string, callback?: (err?: any) => void): void {
      // Wrap in asynchronous function
      (async () => {
        // Destroy session
        await sessionCollection.delete({ sid });
      })()
        .then(callback)
        .catch((err) => {
          if (callback) {
            return callback(err);
          }
        });
    }

    /**
     * Clear all sessions
     * @author Gabe Abrams
     * @param callback session callback function (called with error)
     */
    public clear(callback?: (err?: any) => void): void {
      // Wrap in asynchronous function
      (async () => {
        // Destroy all sessions
        await sessionCollection.deleteAll({});
      })()
        .then(callback)
        .catch((err) => {
          if (callback) {
            return callback(err);
          }
        });
    }

    /**
     * Get all sessions
     * @author Gabe Abrams
     * @param callback session callback function (called with all session datas or error)
     */
     public all(callback: (err: any, obj?: SessionDataType[] | null) => void): void {
      // Wrap in asynchronous function
      (async () => {
        // Look up all sessions and return them
        const results = await sessionCollection.find({});
        return results.map((result) => {
          return result.sessionData;
        });
      })()
        .then((results: SessionDataType[] | null) => {
          return callback(null, results);
        })
        .catch((err) => {
          return callback(err);
        });
    }

    /**
     * Count the number of sessions
     * @author Gabe Abrams
     * @param callback session callback function (called with all session datas or error)
     */
     public length(callback: (err: any, length?: number) => void): void {
      // Wrap in asynchronous function
      (async () => {
        // Look up all sessions and return them
        const numSessions = await sessionCollection.count({});
        return numSessions;
      })()
        .then((num: number) => {
          return callback(null, num);
        })
        .catch((err) => {
          return callback(err);
        });
    }

    /**
     * Touch a session to reset its expiry
     * @param sid the user's session id
     * @param session updated session data
     * @param callback callback to call when finished
     */
    public touch(sid: string, session: SessionDataType, callback?: () => void): void {
      // Wrap in asynchronous function
      (async () => {
        // Create a session item
        const item: CACCLSessionItem = {
          sid,
          sessionData: session,
          appVersion: currVersion,
          timestamp: Date.now(),
        };

        // Insert
        await sessionCollection.insert(item);
      })()
        .then(callback)
        .catch(callback);
    }
  }

  return new MangoStore();
};

export default getMangoStore;
