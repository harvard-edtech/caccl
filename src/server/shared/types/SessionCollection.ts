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
  /**
   * Count the number of matching elements
   * @param query the query to run
   * @returns number of documents that match
   */
  count(query: { [k in string]: any }): Promise<number>,
  /**
   * Find elements then only return the values for one specific property from
   *   each item
   * @param query the query to run
   * @param prop the name of the property to extract
   * @param [excludeFalsy] if true, exclude falsy values
   * @returns array of values of the property
   */
  findAndExtractProp(
    query: { [k in string]: any },
    prop: string,
    excludeFalsy?: boolean,
  ): Promise<any[]>,
  /**
   * Delete all documents that match the query in the collection
   * @param query the query that will match the items to delete
   */
  deleteAll(query: { [k in string]: any }): Promise<void>,
};

export default SessionCollection;
