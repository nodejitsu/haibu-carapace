var daemon = require('daemon'),
    path = require('path');

module.exports = function chrootPlugin(drone) {
  if (!drone.chroot) {
    drone.chroot = function (value, done) {
      var root = path.resolve(value);

      //
      // Attempt changing the working directory
      //
      process.cwd(root);

      //
      // Attempt `daemon.chroot` call
      //
      try {
        daemon.chroot(root);
      } catch (ex) {
        if (ex.code === "EPERM") {
          console.log(('error:'.red + ' You do not have sufficient rights to `daemon.chroot` ' + root.grey));
          console.log(('help:').cyan + ' Try running this command again with `sudo`');
        }
        if (done) {
          return done(ex);
        }
        throw ex;
      }

      //
      // Attempt setting the process id to nobody
      //
      try {
        process.setuid('nobody');
        process.setgid('nobody');
      } catch (ex) {
        if (ex.code === "EPERM") {
          console.log(('error:'.red + ' You do not have sufficient rights to `process.setuid` and `process.setgid` to `nobody`'));
          console.log(('help:').cyan + ' Try running this command again with `sudo`');
        }
        if (done) {
          return done(ex);
        }

        //
        // Remark: I could not get this to work on Mac OS,
        // so for now, I've commented out the throw
        //
        //throw ex;
        console.log(ex);
      }

      process.execPath = process.execPath.replace(new RegExp("^"+root.replace(/\W/g,"\\$&")),'');

      //
      // Append the request dir as the default
      //
      drone.cli.defaultOptions['chroot'].default = value;
      drone.cli.defaultOptions['chroot'].required = true;

      return done ? done() : null;
    };

    drone.on('chroot::root', function () {
      drone.chroot.apply(this, [].slice.call(arguments, 1));
    });
  }
};
