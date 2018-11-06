/*------------------------------------------------------------------------*/
/*                         Functions for Printing                         */
/*------------------------------------------------------------------------*/

/**
 * Prints a new console header
 * @param {string} str - the string to print
 */
module.exports.head = (str) => {
  console.log(`\n${str}`);
};

/**
 * Prints a new console item
 * @param {string} str - the string to print
 */
module.exports.item = (str) => {
  console.log(`- ${str}`);
};

/**
 * Prints a new console subitem
 * @param {string} str - the string to print
 */
module.exports.sub = (str) => {
  console.log(`  - ${str}`);
};
