/*
 * Test _doListen function in net.js of haibu.carapace when there are multiple servers
 *
 */
var net = require('net'),
    port = 80;

var server1 = net.createServer(function (socket) {
});


server1.addListener('error', function (err) {
  process.exit(101);
});

//
// start server1 to use the test port and address...
//
server1.listen(port, 'localhost', function () {
  ;
});
