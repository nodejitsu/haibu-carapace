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
    
module.exports = function overrideNet() {
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
    if(!port) {
      return 8000;
    }
    //
    // Find the next port that we are not supposed to ignore or cause errors on
    //
    var unavailable = carapace.ports.ignore.concat(carapace.ports.throw);
    do {
      port = port + 1;
    }
    while(unavailable.indexOf(port) !== -1);
    return port;
  }
  
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
  //   done(carapace.proxy.ports);
  // });
  
  //
  // Separate since net.Server uses a cached bind function
  //
  net.Server.prototype._doListen = function () {
    var self = this,
        desired = toPort(arguments[0]),
        addr = arguments[1],
        current,
        actual;
        
    // Ensure we have a dummy fd for EMFILE conditions.
    getDummyFD();
    
    //
    // Always throw if our desired port was one that should always throw
    //
    if(carapace.ports.throw.indexOf(desired) !== -1) {
      self.close();
      //
      // Build fake error
      //
      var err = new Error('EADDRINUSE, Address already in use');
      err.code = 'EADDRINUSE';
      err.syscall = 'bind';
      err.errno = 100;
      self.emit('error', err);
      return;
    }
    //
    // Since desired is not on a throwing port
    // we want to skip ports in both throw and ignore
    //
    current = desired ? desired : nextPort(desired);
    
    for(;;) {
      try {
        binding.bind(self.fd, current, addr);
        break;
      } 
      catch (err) {
        //
        // Find the next port we are not supposed to throw up on or ignore
        //
        current = nextPort(current);
        
        //
        // If this is not an `EADDRINUSE` error or the port is in 
        // `carapace.ports.throw` which should always throw an error, 
        // then throw the error.
        //
        if (err.code !== 'EADDRINUSE') {
          self.close();
          self.emit('error', err);
          return;
        }
      }
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
        // Store the server that has listened on the `desired` port
        // on the carapace itself, indexed by port.
        //
        carapace.servers[desired] = self;
        
        carapace.emit('carapace::port', {
          id: carapace.id, 
          desired: desired, 
          port: actual
        });
      } 
      catch (err) {
        if (err.code !== 'EADDRINUSE') {
          self.close();
          self.emit('error', err);
        }
        else {
          self._doListen(desired, addr);
        }
        return;
      }
  
      self._startWatcher();
    });
  };
}
