/*------------------------------------------------------------------------*/
/*                         Functions for Printing                         */
/*------------------------------------------------------------------------*/

const print = {};

/**
 * Prints a new console header
 * @author Gabe Abrams
 * @param {string} str - the string to print
 */
print.head = (str) => {
  // eslint-disable-next-line no-console
  console.log(`\n${str}`);
};

/**
 * Prints the status for a configuration variable
 * @author Gabe Abrams
 * @param {string} name - the name of the variable
 * @param {boolean} isIncluded - if truthy, variable is marked as "included",
 *   otherwise marked as "excluded"
 * @param {string} [explanation] - added as a second line
 */
print.variable = (name, isIncluded, explanation) => {
  // eslint-disable-next-line no-console
  console.log(`- ${isIncluded ? print.inGreen('included') : print.inYellow('excluded')}: "${name}"${explanation ? '\n' : ''}${print.inGray(explanation)}`);
};

/**
 * Prints the status for a configuration boolean
 * @author Gabe Abrams
 * @param {string} name - the name of the boolean
 * @param {boolean} value - if truthy, variable is marked as "true",
 *   otherwise marked as "false"
 * @param {string} [explanation] - added as a second line
 */
print.boolean = (name, value, explanation) => {
  // eslint-disable-next-line no-console
  console.log(`- ${value ? print.inGreen('true') : print.inYellow('false')}: "${name}"${explanation ? '\n' : ''}${print.inGray(explanation)}`);
};

/**
 * Prints a subtitle (grayed out item, indented once)
 * @author Gabe Abrams
 * @param {string} str - the text in the subtitle
 */
print.subtitle = (str) => {
  // eslint-disable-next-line no-console
  console.log(print.inGray(`   - ${str}`));
};

/**
 * Prints a subsubtitle (grayed out item, indented twice)
 * @author Gabe Abrams
 * @param {string} str - the text in the subtitle
 */
print.subsubtitle = (str) => {
  // eslint-disable-next-line no-console
  console.log(print.inGray(`     - ${str}`));
};

// Styles
const RESET = '\x1b[39m';
const BLACK = '\x1b[30m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const WHITE = '\x1b[37m';
const GRAY = '\x1b[90m';

// Functions to put strings into color
print.inBlack = (str) => {
  return `${BLACK}${str}${RESET}`;
};
print.inRed = (str) => {
  return `${RED}${str}${RESET}`;
};
print.inGreen = (str) => {
  return `${GREEN}${str}${RESET}`;
};
print.inYellow = (str) => {
  return `${YELLOW}${str}${RESET}`;
};
print.inBlue = (str) => {
  return `${BLUE}${str}${RESET}`;
};
print.inMagenta = (str) => {
  return `${MAGENTA}${str}${RESET}`;
};
print.inCyan = (str) => {
  return `${CYAN}${str}${RESET}`;
};
print.inWhite = (str) => {
  return `${WHITE}${str}${RESET}`;
};
print.inGray = (str) => {
  return `${GRAY}${str}${RESET}`;
};

// Create non-verbose version where each function does nothing
const printNonVerbose = {};
Object.keys(print).forEach((key) => {
  printNonVerbose[key] = () => { return ''; };
});

/**
 * Return a print object or a dummy object if verbose is false
 * @author Gabe Abrams
 * @param {boolean} [verbose] - if true, print function that's returned will
 *   actually print (otherwise, it will do nothing)
 * @return {function} print function
 */
module.exports = (verbose) => {
  if (verbose) {
    return print;
  }
  return printNonVerbose;
};
