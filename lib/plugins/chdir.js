var path = require('path');

module.exports = function chdirPlugin(carapace) {
  if (!carapace.chdir) {
    carapace.chdir = function (value, done) {
      try { process.chdir(path.resolve(value)) }
      catch (ex) { return done ? done(ex) : null }

      //
      // Append the request value to be the default dir
      // this should ALWAYS overwrite and previous value
      //
      carapace.cli.defaultOptions['chdir'].default = value;
      carapace.cli.defaultOptions['chdir'].required = true;
      return done ? done() : null;
    };

    carapace.on('chdir::path', function () {
      carapace.chdir.apply(this, [].slice.call(arguments, 1));
    });
  }
};
