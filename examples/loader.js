var carapace = require('../');
var path = require('path');
var bridge = process.argv.splice(2,1)[0];
carapace.wrap(bridge, function() {
  carapace.emit('plugin',carapace.plugins.heartbeat, function(err) {
    if(err) {
      console.error(err.stack);
      process.exit();
    }
    carapace.emit('plugin',carapace.plugins.chroot, function(err) {
      if(err) {
        console.error(err.stack);
        process.exit();
      }
      carapace.emit('plugin',carapace.plugins.chdir, function(err) {
        if(err) {
          console.error(err.stack);
          process.exit();
        }
        carapace.emit('chroot:root','./tobechrooted', function(err) {
          carapace.emit('chdir:path','.', function(err) {
            carapace.emit('run',['./server.js']);
          });
        });
      });
    });
  });
});
