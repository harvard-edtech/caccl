// Import Express Session
import session from 'express-session';

/**
 * One CACCL session item that should be stored in a dce-mango collection
 * @author Gabe Abrams
 */
type CACCLSessionItem = {
  // Express session id
  sid: string,
  // Session data
  sessionData: session.SessionData,
  // Version of the caccl app that wrote the session item
  // (npm package version)
  appVersion: string,
  // Timestamp the item was created
  timestamp: number, // ms since epoch
};

export default CACCLSessionItem;
