var path = require('path'),
    carapace = require('../lib/carapace');

var script = 'server.js',
    scriptPort = 31337;

carapace.on('carapace::plugin::error', function (info) {
  console.log('Error loading plugin: ' + info.plugin);
  console.log(info.error.message);
  console.dir(info.error.stack.split('\n'))
});

carapace.use([
  carapace.plugins.heartbeat,
  carapace.plugins.chdir
], function () {
  carapace.chdir(path.join(__dirname, 'app'));
  carapace.run(script, ['--port', scriptPort], function afterRun() {
    carapace.heartbeat(function () {
      carapace.on('heartbeat', function () {
        console.log('still running');
      });
    }, 1000);
    console.log(script + ' running on port ' + scriptPort.toString());
  });
});  
