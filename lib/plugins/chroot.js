var daemon = require('daemon'),
    path = require('path');

module.exports = function chrootPlugin (carapace) {
  if (!carapace.chroot) {
    carapace.chroot = function (value, done) {
      daemon.chroot(path.resolve(value));
      return done ? done() : null;
    }; 
    
    carapace.on('chroot::root', function() {
      carapace.chroot.apply(this, [].slice.call(arguments,1));
    });
  }  
};
