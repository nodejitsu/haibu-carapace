var drone = require('../lib/drone');

drone.debug = true;
drone.on('drone::plugin::error', function (info) {
  console.log('Error loading plugin: ' + info.plugin);
  console.log(info.error.message);
  console.dir(info.error.stack.split('\n'))
});

drone.script = 'helloworld.js';

drone.use([
  drone.plugins.heartbeat,
], function () {
  drone.start(function(err){
    if (err) {
      return console.log(err);
    }
    drone.heartbeat(function () {
      console.log('info: ' + 'bump'.red);
    },1000);
    console.log('info: ' + drone.script + ' running on port '+ drone.port);
  });
});
