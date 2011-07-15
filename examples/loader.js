var path = require('path');
var carapace = require('../');
var bridgePath = path.resolve(process.argv[2]);

console.log('connecting to ' + bridgePath)
require('dnode').connect(bridgePath, function(client, conn) {
  console.log('loading plugin ' + carapace.plugins.chroot);
  //
  // Connections to Carapace do not keep it open!
  //
  conn.on('end',function(){
    console.log('Carapace connection had ended.')
  });
  client.emit('plugin',carapace.plugins.chroot, function() {
    console.log('plugin done')
    client.emit('chroot:root','..', function() {
      client.emit('run', 'examples/server.js');
    });
  })
});
