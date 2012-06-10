var carapace = require('../lib/carapace');

carapace.on('carapace::plugin::error', function (info) {
  console.log('Error loading plugin: ' + info.plugin);
  console.log(info.error.message);
  console.dir(info.error.stack.split('\n'))
});

carapace.script = 'helloworld.js';

carapace.use([
  carapace.plugins.heartbeat, 
], function () {
  carapace.run(function afterRun(err) {
    if (err) {
      return console.log(err);
    }
    carapace.heartbeat(function () {
      console.log('bump'.red);
    },1000);
    console.log(carapace.script + ' running on port '+ carapace.port);
  });
});  
