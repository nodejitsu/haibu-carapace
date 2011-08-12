/*
* net.js: Wrapper around node.js core `net` module for observing relevant events
*
* (C) 2011 Nodejitsu Inc.
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
// Helper function from node.js core for
// working with `dummyFD`
//
function getDummyFD () {
  if (!dummyFD) {
    try { dummyFD = socket('tcp') }
    catch (e) { dummyFD = null }
  }
}


//
// Internal mapping of server instances to
// ports that have been mapped via `.listen()`.
//
carapace.servers = {}

// carapace.on('proxy::list', function (done) {
// done(carapace.proxy.ports);
// });

//
// Separate since net.Server uses a cached bind function
//
net.Server.prototype._doListen = function () {
  var self = this,
      desired = toPort(arguments[0]),
      addr = arguments[1],
      actual;

  // get unused socket
  self.fd = socket(self.type);

  // save first requested desired port/reference
  if (!self.__desired) self.__desired = desired;

  // Ensure we have a dummy fd for EMFILE conditions.
  getDummyFD();
  
  find_port:
  for(;;) {
    try {
      binding.bind(self.fd, desired, addr);
      break find_port;
    }
    catch (err) {
      //
      // If this is not an `EADDRINUSE` error or the port is in
      // `carapace.ports.throw` which should always throw an error,
      // then throw the error.
      //
      if (err.code !== 'EADDRINUSE' || carapace.ports.throw.indexOf(desired) !== -1) {
        self.close();
        return self.emit('error', err);
      }
      
      desired = nextPort(desired);
    }
  }

  // get current bind port
  actual = this.address().port;

  //
  // Need to the listening in the nextTick so that people potentially have
  // time to register 'listening' listeners.
  //
  return process.nextTick(function() {
    //
    // It could be that server.close() was called between the time the
    // original listen command was issued and this. Bail if that's the case.
    // See test/simple/test-net-eaddrinuse.js
    //
    if (typeof self.fd !== 'number') return;

    try {
      listen(self.fd, self._backlog || 128);
      
      //
      // Store the server that has listened on the `desired` port
      // on the carapace itself, indexed by port.
      //
      carapace.servers[actual] = self;
      
      //
      // If the desired port is not in union of `carapace.ports.throw`,
      // and `carapace.ports.ignore` then emit the `carapace::port` event.
      //
      // Remark: How does this work with multi-server programs?
      //
      if (carapace.ports.throw.concat(carapace.ports.ignore).indexOf(actual) === -1) {
        carapace.emit('carapace::port', {
          id: carapace.id,
          desired: self.__desired,
          port: actual
        });
      }
    }
    catch (err) {
      if (err.code !== 'EADDRINUSE' || carapace.ports.throw.indexOf(actual) !== -1) {
        self.close();
        self.emit('error', err);
      }
      else {
        self._doListen(actual, addr);
      }
      return;
    }

    self._startWatcher();
  });
};