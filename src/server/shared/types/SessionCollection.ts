// Import shared types
import CACCLSessionItem from './CACCLSessionItem';

/**
 * Session collection (based off of dce-mango)
 * @author Gabe Abrams
 */
type SessionCollection = {
  /**
   * Run a query
   * @param query the query to run
   * @returns documents
   */
  find: (
    query: { [k in string]: any },
  ) => Promise<CACCLSessionItem[]>,
  /**
   * Write a record to the collection
   * @param obj the object to insert
   */
  insert: (obj: CACCLSessionItem) => void | Promise<void>,
  /**
   * Delete the first document that matches the query in the collection
   * @param query the query that will match the item
   */
  delete: (query: { [k in string]: any }) => void | Promise<void>,
};

export default SessionCollection;
