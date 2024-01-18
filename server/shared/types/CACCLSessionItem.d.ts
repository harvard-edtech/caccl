import session from 'express-session';
/**
 * One CACCL session item that should be stored in a dce-mango collection
 * @author Gabe Abrams
 */
type CACCLSessionItem = {
    sid: string;
    sessionData: session.SessionData;
    appVersion: string;
    timestamp: number;
};
export default CACCLSessionItem;
