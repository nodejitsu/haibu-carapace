var path = require('path');
module.exports = function chdirPlugin (carapace) {
  carapace.on('chdir:path', function (value, done) {
    process.chdir(path.resolve(value));
    return done ? done() : null;
  });
}
