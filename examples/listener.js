//
// TODO: THIS EXAMPLE SCRIPT NEEDS TO BE REFACTORED FOR HOOK.IO
//

var path = require('path');
var bridgePath = path.resolve(process.argv[2]);

console.log('connecting to ' + bridgePath)
require('dnode').connect(bridgePath, function (client, conn) {
  console.log('connected');
  client.on('heartbeat', function () {
    console.log('listened to heartbeat')
  })
  conn.on('end', function () {
    console.log('Carapace connection had ended.')
  });
});

