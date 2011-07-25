/*
 * net.js: Wrapper around node.js core `net` module for observing relevant events
 *
 *  (C) 2011 Nodejitsu Inc.
 *
 */
 
var net = require('net'),
    binding = process.binding('net'),
    carapace = require('./carapace');

var netListen = net.Server.prototype._doListen;

//
// Helper function from Node code to parse port arguments
// passed to net.prototype.Server.listen
//
function toPort(x) { 
  return (x = Number(x)) >= 0 ? x : false; 
}

//
// ### function nextPort (port)
// #### @port {Number} Port to increment from.
// Gets the next port in sequence from the 
// specified `port`.
//
function nextPort (port) {
  console.log('port: ' + port);
  return port 
    ? port + 1
    : 8000;
};

//
// Internal mapping of server instances to
// ports that have been mapped via `.listen()`.
//
carapace.servers = {}

// carapace.on('proxy::list', function (done) {
//   done(carapace.proxy.ports);
// });

//
// Server _doListen clobber
//
// This needs to be done because listen uses a cached bind
// Listening on a port should be deferred to any port and a port mapping should be emitted
//
net.Server.prototype._doListen = function _doListen () {
  var self = this,
      desired = toPort(arguments[0]),
      actual,
      result;

  result = netListen.apply(this, arguments);
  actual = this.address().port;
  
  if (!desired) {
    desired = actual;
  }
  
  process.nextTick(function () {
    //
    // Remark: How does this work with multi-server programs?
    //
    carapace.servers[desired] = this;
    carapace.emit('carapace::port', desired);
  });
  
  return result;
};