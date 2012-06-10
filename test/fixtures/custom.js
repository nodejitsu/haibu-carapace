/*
 * custom.js: Test fixture for a custom plugin in haibu-drone.
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var enabled = false;
 
module.exports = function customPlugin (drone) {
  if (!drone.custom) {
    drone.custom = function (args, done) {
      if (enabled) {
        return done ? done() : null;
      }
      
      enabled = true;
      
      this.interval = setInterval(function () {
        drone.emit('custom', { id: drone.id, custom: true });
      }, 1000);
      
      if (done) {
        done();
      }      
    };
  }
};
