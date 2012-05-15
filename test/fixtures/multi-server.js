/*
 * Test _doListen function in net.js of haibu.carapace when there are multiple servers
 *
 */
var net = require('net'),
    port = 8000;

var server1 = net.createServer(function (socket) {
});

var server2 = net.createServer(function (socket) {
});

var server3 = net.createServer(function (socket) {
});

server1.addListener('error', function (err) {
  process.exit(101);
});

server2.addListener('error', function (err) {
  process.exit(102);
});

server3.addListener('error', function (err) {
  process.exit(103);
});

//
// start server1 to use the test port and address...
//
server1.listen(port, 'localhost', function () {
  var ready = false;

  //
  // Server1 is occupying the test port and address so now spawn up more servers
  //

  server2.listen(port, 'localhost', function () {
    if (ready) process.exit(0);
    ready = true;
  });

  server3.listen(port, 'localhost', function () {
    if (ready) process.exit(0);
    ready = true;
  });

});
