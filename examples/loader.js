var carapace = require('../lib/carapace');
var path = require('path');
var bridge = process.argv.splice(2,1)[0];

carapace.listen(bridge, function () {
  carapace.on('carapace:plugin:error', function (plugin, ex) {
    console.log('Error loading plugin: ' + plugin);
    console.log(ex.message);
    console.dir(ex.stack.split('\n'))
  });
  
  carapace.use([
    carapace.plugins.heartbeat, 
    carapace.plugins.chroot, 
    carapace.plugins.chdir
  ], function () {
    carapace.chroot('./tobechrooted');
    carapace.chdir('.');
    carapace.run(['./server.js']);
  });  
});
