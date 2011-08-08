/*
 * checkargs.js: Test fixture for a custom plugin in haibu-carapace which uses custom arguments.
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */
 
module.exports = function checkargsPlugin (carapace) {
  if (!carapace.checkargs) {
    carapace.checkargs = function () {
      setInterval(function () {
        carapace.emit('carapace::checkargs', { id: carapace.id, checkargs: process.argv['checkargs'] });
      }, 1000);
    };
    
    carapace.checkargs();
  }
};