var carapace = require('../lib/carapace');

var script = 'server.js',
    hookOpts = {
      'debug' : false,
      'hook-port' :  5061
    },
    scriptPort = 31337;

carapace.listen( hookOpts,function () {
  carapace.on('carapace::plugin::error', function (plugin, ex) {
    console.log('Error loading plugin: ' + plugin);
    console.log(ex.message);
    console.dir(ex.stack.split('\n'))
  });

  carapace.use([
    carapace.plugins.heartbeat, 
    carapace.plugins.chroot, 
    carapace.plugins.chdir
  ], function () {
    carapace.chroot('./examples/chroot-jail', console.log.bind(null, 'hello'));
    carapace.chdir('.');
    carapace.run(script, ['--port', scriptPort], function afterRun() {
      carapace.heartbeat(function () {
        console.log('bump'.red);
      },1000);
      console.log(script+ ' running on port '+ scriptPort.toString());
    });
  });  
});
