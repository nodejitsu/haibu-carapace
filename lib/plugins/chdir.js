var path = require('path');

module.exports = function chdirPlugin (carapace) {
  if (!carapace.chdir) {
    carapace.chdir = function (value, done) {
      process.chdir(path.resolve(value));
      return done ? done() : null;
    };
    
    carapace.on('chdir:path', carapace.chdir);
  }  
}
