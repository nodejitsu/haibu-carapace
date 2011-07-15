var path = require('path');
var carapace = require('../');
var bridgePath = path.resolve(process.argv[2]);
console.log('connecting to ' + bridgePath)
require('dnode').connect(bridgePath, function(client, conn) {
  console.log('loading plugin ' + carapace.plugins.chroot);
  client.emit('plugin',carapace.plugins.chroot, function() {
    console.log('plugin done')
    console.dir(arguments)
    client.emit('chroot:root','..', function() {
      client.emit('run', 'examples/server.js');
      //
      // Kill our connection to carapace (this connection will prevent carapace from closing due to IOWatchers)
      //
      conn.end();
    });
  })
});
