/*
 * relative-plugin.js: Test fixture for a custom plugin in haibu-carapace.
 *
 *  (C) 2011 Nodejitsu Inc.
 *
 */
 
module.exports = function relativePlugin (carapace) {
  if (!carapace.relative) {
    carapace.relative = function () {
      setInterval(function () {
        carapace.emit('carapace::relative', { id: carapace.id, relative: true });
      }, 1000);
    };
    
    carapace.relative();
  }
};