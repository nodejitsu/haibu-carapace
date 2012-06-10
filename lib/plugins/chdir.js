var path = require('path');

module.exports = function chdirPlugin(drone) {
  if (!drone.chdir) {
    drone.chdir = function (value, done) {

      try { process.chdir(path.resolve(value)) }
      catch (ex) { return done ? done(ex) : null }

      drone.cli.defaultOptions['chdir'].default = value;
      drone.cli.defaultOptions['chdir'].required = true;

      if (drone.debug) {
        console.log('The current working directory of ' + drone.script + ' has been changed to ' + path.resolve(value));
      }

      return done ? done() : null;
    };
  }
};
