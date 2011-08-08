/*
 * custom.js: Test fixture for a custom plugin in haibu-carapace.
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var enabled = false;
 
module.exports = function customPlugin (carapace) {
  if (!carapace.custom) {
    carapace.custom = function (args, done) {
      enabled = !enabled;

      if (!enabled) {
        return done ? done() : null;
      }
      
      this.interval = setInterval(function () {
        carapace.emit('carapace::custom', { id: carapace.id, custom: true });
      }, 1000);
      
      if (done) {
        done();
      }      
    };
    
    carapace.custom();
  }
};