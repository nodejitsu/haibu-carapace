var path = require('path');

module.exports = function chdirPlugin (carapace) {
  if (!carapace.chdir) {
    carapace.chdir = function (value, done) {
      // 
      // Append the request value to be the default dir
      // this should ALWAYS overwrite and previous value
      //
      carapace.cli.defaultOptions['chdir'].default = value;
      carapace.cli.defaultOptions['chdir'].required = true;
      process.chdir(path.resolve(value));
      return done ? done() : null;
    };
    
    carapace.on('chdir::path', function(event, value, done) {
      carapace.chdir.apply(this, [].slice.call(arguments,1));
    });
  }  
}
