var path = require('path');

module.exports = function chdirPlugin(carapace) {
  if (!carapace.chdir) {
    carapace.chdir = function (value, done) {
      try { process.chdir(path.resolve(value)) }
      catch (ex) { return done ? done(ex) : null }

      carapace.cli.defaultOptions['chdir'].default = value;
      carapace.cli.defaultOptions['chdir'].required = true;
      return done ? done() : null;
    };
  }
};
