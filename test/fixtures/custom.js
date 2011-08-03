/*
 * custom-plugin.js: Test fixture for a custom plugin in haibu-carapace.
 *
 *  (C) 2011 Nodejitsu Inc.
 *
 */
 
module.exports = function customPlugin (carapace) {
  if (!carapace.custom) {
    carapace.custom = function () {
      setInterval(function () {
        carapace.emit('carapace::custom', { id: carapace.id, custom: true });
      }, 1000);
    };
    
    carapace.custom();
  }
};