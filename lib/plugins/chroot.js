var daemon = require('daemon'),
    path = require('path');

module.exports = function chrootPlugin(carapace) {
  if (!carapace.chroot) {
    carapace.chroot = function (value, done) {
      var root = path.resolve(value);
      try {
        process.cwd(root);
        daemon.chroot(root);
        process.setuid('nobody');
        process.setgid('nobody');
      }
      catch (ex) { return done ? done(ex) : null }
      
      process.execPath = process.execPath.replace(new RegExp("^"+root.replace(/\W/g,"\\$&")),'');

      //
      // Append the request dir as the default
      //
      carapace.cli.defaultOptions['chroot'].default = value;
      carapace.cli.defaultOptions['chroot'].required = true;

      return done ? done() : null;
    };

    carapace.on('chroot::root', function () {
      carapace.chroot.apply(this, [].slice.call(arguments, 1));
    });
  }
};
