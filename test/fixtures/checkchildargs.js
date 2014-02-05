/*
 * Test client argument rewrite of haibu.carapace
 *
 */

console.log('%j', process.argv);

// no need to call process.exit().
// Prevents stdout from being sent before exit
// especially on win32
