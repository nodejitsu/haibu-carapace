/*
 * Test _doListen function in net.js of haibu.carapace
 *
 * This process will exit with:
 *   0 = all tests passed
 *   1 = test port occupied. Couldn't do the real tests.
 *   2 = first catch/try of _doListen fails
 *   3 = 2nd catch/try of _doListen fails
 */
var net = require('net'),
    port = 8000;

var server1 = net.createServer(function(socket) {
});

var server2 = net.createServer(function(socket) {
});

var server3 = net.createServer(function(socket) {
});

server1.addListener('error', function(err) {
  console.error('Server 1 listening error!!!', err, err.stack);
  process.exit(1);
});

server2.addListener('error', function(err) {
  console.error('Server 2 listening error!!!', err, err.stack);
  process.exit(2);
});

server3.addListener('error', function(err) {
  console.error('Server 3 listening error!!!', err, err.stack);
  process.exit(3);
});

//
// start server1 to use the test port and address...
//
server1.listen(port, 'localhost', function() {
  var ready = false;

  //
  // Server1 is occupying the test port and address so now do the tests!!
  //

  // 
  // If server2 fails to start then the first catch-try isn't working!!
  //
  server2.listen(port, 'localhost', function() {
    // server3 ready ?? then all ok!!
    if (ready) process.exit(0);
    // wait for server3
    ready = true;
  });

  //
  // Start server3 together with server2 to test the 2nd catch-try after
  // process.nextTick !! 
  //
  server3.listen(port, 'localhost', function() {
    // server2 ready ?? then all ok!!
    if (ready) process.exit(0);
    // wait for server2
    ready = true;
  });

});