/*
 * net.js: Wrapper around node.js core `net` module for observing relevant events
 *
 *  (C) 2011 Nodejitsu Inc.
 *
 */
 
var net = require('net'),
    binding = process.binding('net'),
    carapace = require('./carapace');

var dummyFD = null,
    socket = binding.socket,
    listen = binding.listen;

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

net.Server.prototype._doListen = function() {
  var self = this,
      desired = toPort(arguments[0]),
      actual;
      
  // Ensure we have a dummy fd for EMFILE conditions.
  getDummyFD();

  try {
    binding.bind(self.fd, arguments[0], arguments[1]);
  } 
  catch (err) {    
    if (err.code !== 'EADDRINUSE' || desired === carapace['hook-port']) {
      self.close();
      self.emit('error', err);
      return;
    }
    
    return this._doListen.call(this, nextPort(desired), arguments[1]);
  }
  
  actual = this.address().port;
  if (!desired) {
    desired = actual;
  }

  //
  // Need to the listening in the nextTick so that people potentially have
  // time to register 'listening' listeners.
  //
  process.nextTick(function() {
    //
    // It could be that server.close() was called between the time the
    // original listen command was issued and this. Bail if that's the case.
    // See test/simple/test-net-eaddrinuse.js
    //
    if (typeof self.fd !== 'number') return;

    try {
      listen(self.fd, self._backlog || 128);
      
      //
      // Remark: How does this work with multi-server programs?
      //
      carapace.servers[desired] = self;
      carapace.emit('*::port', desired);
    } 
    catch (err) {
      self.close();
      self.emit('error', err);
      return;
    }

    self._startWatcher();
  });
};

function getDummyFD () {
  if (!dummyFD) {
    try {
      dummyFD = socket('tcp');
    } catch (e) {
      dummyFD = null;
    }
  }
}