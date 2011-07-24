var daemon = require('daemon'),
    path = require('path');

module.exports = function chrootPlugin (carapace) {
  if (!carapace.chroot) {
    
    carapace.chroot = function (value, done) {
      daemon.chroot(path.resolve(value));
      //
      // append the request dir as the default
      //
      carapace.cli.defaultOptions['chroot'].default = value;
      carapace.cli.defaultOptions['chroot'].required = true;
      return done ? done() : null;
    }; 
    
    carapace.on('chroot::root', function() {
      carapace.chroot.apply(this, [].slice.call(arguments,1));
    });
  }  
};
