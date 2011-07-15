var daemon = require('daemon');
var path = require('path');
module.exports = function (carapace) {
  carapace.on('chroot:root',function (value, done) {
    daemon.chroot(path.resolve(value));
    if(done) done();
  });
}
