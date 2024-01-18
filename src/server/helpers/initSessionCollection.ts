/**
 * Given an instance of the collection class from dce-mango, create a session collection.
 *   To add to your dce-mango mongo.ts file, use the following:
 *   import CACCLSessionItem from 'caccl/types/CACCLSessionItem';
 *   ...
 *   export const sessionCollection = initSessionCollection(Collection) as Collection<CACCLSessionItem>;
 * @author Gabe Abrams
 * @param Collection collection class instance
 * @param [opts.express.sessionMins=env.SESSION_MINS || 360] number of minutes
 *   the session should last for
 * @returns initialized collection
 */
const initSessionCollection = (Collection: any, sessionMins?: number): any => {
  // Calculate ttl
  const sessionMinsInitialized = (
    sessionMins
    || process.env.SESSION_MINS ? Number.parseInt(process.env.SESSION_MINS || '', 10) : undefined
    || 360
  );
  const expireAfterSeconds = (sessionMinsInitialized * 60);

  // Initialize collection
  return new Collection(
    'CACCLSessionItem',
    {
      uniqueIndexKey: 'sid',
      expireAfterSeconds,
    },
  );
};

export default initSessionCollection;
