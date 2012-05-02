var path = require('path');

module.exports = function setuidPlugin(carapace) {
  if (!carapace.setuid) {
    carapace.setuid = function (value, done) {
      try { process.setuid(value) }
      catch (ex) { return done ? done(ex) : null }

      carapace.cli.defaultOptions['setuid'].default = value;
      carapace.cli.defaultOptions['setuid'].required = true;
      return done ? done() : null;
    };
  }
};
