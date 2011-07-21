var path = require('path');

module.exports = function chdirPlugin (carapace) {
  if (!carapace.chdir) {
    carapace.chdir = function (value, done) {
      console.dir(arguments)
      console.log('changed cwd')
      process.chdir(path.resolve(value));
      return done ? done() : null;
    };
    
    carapace.on('chdir:path', function(event, value, done) {
      carapace.chdir.apply(this, [].slice.call(arguments,1))
    });
  }  
}
