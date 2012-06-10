var drone = require('../lib/drone');

drone.debug = true;

drone.on('drone::plugin::error', function (info) {
  console.log('Error loading plugin: ' + info.plugin);
  console.log(info.error.message);
  console.dir(info.error.stack.split('\n'))
});

//
// Remark: The start script must be in the chroot-jail, or it won't start.
//
drone.script = "./server.js";

drone.use([
  drone.plugins.chroot,
  drone.plugins.chdir
], function () {
  drone.chroot('./chroot-jail');
  drone.chdir('.');
  drone.start(function afterStart(err) {
    if (err) {
      return console.log(err);
    }
    console.log(drone.script+ ' running on port '+ drone.port);
  });
});  
