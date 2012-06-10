var path = require('path');

module.exports = function setuidPlugin(drone) {
  if (!drone.setuid) {
    drone.setuid = function (value, done) {
      try { process.setuid(value) }
      catch (ex) { return done ? done(ex) : null }

      drone.cli.defaultOptions['setuid'].default = value;
      drone.cli.defaultOptions['setuid'].required = true;
      return done ? done() : null;
    };
  }
};
