
/*
 * net.js: Wrapper around node.js core `net` module for observing relevant events
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var net = require('net'),
    semver = require('semver'),
    carapace = require('../carapace');

//
// ### function override (version)
// Helper function which overrides with the correct `net` module
// override for current node version.
//
module.exports = function (carapace) {
  carapace.net = function (argv, next) {
    var version = process.version,
        methods = Object.keys(module.exports),
        method;

    for (var i = 0; i < methods.length; i++) {
      method = module.exports[methods[i]];
      if (method.nodeVersion && semver.satisfies(version, method.nodeVersion)) {
        method();
        return next();
      }
    }
    throw new Error('No appropiate net override for node version ' + version);
  };
};

//
// ### function toPort(x) 
// #### @x {Number|String} Object to convert to a port number.
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
function nextPort(port) {
  if (!port) {
    return 8000;
  }

  //
  // Find the next port that we are not supposed to ignore or cause errors on
  //
  var unavailable = carapace.ports.ignore.concat(carapace.ports.throw);
  do {
    port = port + 1;
  } while (unavailable.indexOf(port) !== -1);

  return port;
}

//
// ### functon reservedPort 
// #### @desired {Number} Desired port to bind to.
// Helper function which will emit an error if the 
// server (the `this` argument) is in `carapace.ports.throw`
//
function reservedPort(desired) {
  if (carapace.ports.throw.indexOf(desired) !== -1) {
    this.close();
    //
    // Build fake error
    //
    var err = new Error('EADDRINUSE, Address already in use');
    err.code = 'EADDRINUSE';
    err.syscall = 'bind';
    err.errno = 100;
    this.emit('error', err);
    return true;
  }
  
  return false;
}

//
// ### function _doListen ()
// Override for `node@0.4.x`. 
//
module.exports._doListen = function overrideNet() {
  var binding = process.binding('net'),
      socket = binding.socket,
      listen = binding.listen,
      dummyFD = null;
      
  //
  // Helper function from node.js core for
  // working with `dummyFD`
  //
  function getDummyFD() {
    if (!dummyFD) {
      try { dummyFD = socket('tcp') }
      catch (e) { dummyFD = null }
    }
  }

  //
  // Separate since net.Server uses a cached bind function
  //
  net.Server.prototype._doListen = function ourListen() {
    var self = this,
        desired = toPort(arguments[0]),
        addr = arguments[1],
        current,
        actual,
        err;

    // Ensure we have a dummy fd for EMFILE conditions.
    getDummyFD();

    //
    // Always throw if our desired port was one that should always throw
    //
    if (reservedPort.call(this, desired)) {
      return;
    }

    //
    // Since desired is not on a throwing port
    // we want to skip ports in both throw and ignore
    //
    current = desired ? desired : nextPort(desired);

    for (;;) {
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
        if (err.code !== 'EADDRINUSE' && err.code !== 'EACCES') {
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
    process.nextTick(function () {
      //
      // It could be that server.close() was called between the time the
      // original listen command was issued and this. Bail if that's the case.
      // See test/simple/test-net-eaddrinuse.js
      //
      if (typeof self.fd !== 'number') {
        return;
      }

      try {
        listen(self.fd, self._backlog || 128);

        //
        // Store the server that has listened on the `desired` port
        // on the carapace itself, indexed by port.
        //
        carapace.servers[desired] = self;

        carapace.emit('port', {
          id: carapace.id,
          addr: addr,
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
          //
          // Generate a new socket of the same type since we cannot use an already bound one
          //
          self.fd = socket(self.type);
          self._doListen(desired, addr);
        }
        
        return;
      }

      self._startWatcher();
    });
  };
} 

//
// ### function _listen2 ()
// Override for `node@0.5.x` and `node@0.6.x`. 
//
module.exports._listen2 = function overrideNet() {
  var _listen2 = net.Server.prototype._listen2;
  
  net.Server.prototype._listen2 = function ourListen(address, port, addressType, desired) {
    var self = this;

    port = toPort(port);
    desired || (desired = port);

    //
    // Always throw if our desired port was one that should always throw
    //
    if (reservedPort.call(this, port)) {
      return;
    }
    
    //
    // Since desired is not on a throwing port
    // we want to skip ports in both throw and ignore
    //
    port || (port = 0);

    //
    // We rely on `error` event to check if address it taken/available, however
    // user may want to hook up to `error` in his application as well (and
    // usually exit when it's emitted). This messes things up. Here we store
    // `error` event listeners and remove them. They will be restored after we
    // start listening or get an error which is not `EADDRINUSE`.
    //
    var errorListeners = self.listeners('error').slice(0);
    self.removeAllListeners('error');

    function restoreErrorListeners() {
      errorListeners.forEach(function (listener) {
        self.on('error', listener);
      });
    }

    //
    // Problem with `listening` events is a bit different. We want to ensure
    // that we first emit `carapace::port` and *then* the proper `listening`
    // event (which can be consumed by user's app).
    //
    // (Also, not doing so breaks `net/net-multiple-servers-test` test.)
    //
    var listeningListeners = self.listeners('listening').slice(0);
    self.removeAllListeners('listening');

    function restoreListeningListeners() {
      listeningListeners.forEach(function (listener) {
        self.on('listening', listener);
      });
    }

    function onListen() {
      //
      // Yay, we made it! Lets restore `error` listeners and tell the world
      // that we totally owned this port.
      //

      self.removeListener('error', onError);

      restoreErrorListeners();
      restoreListeningListeners();

      //
      // Store the server that has listened on the `desired` port
      // on the carapace itself, indexed by port.
      //
      carapace.servers[desired] = self;

      carapace.emit('port', {
        id: carapace.id,
        addr: address,
        port: self.address().port,
        desired: desired
      });

      process.nextTick(function () {
        self.emit('listening');
      });
    }

    function onError(err) {
      //
      // We failed to listen. Unless it's not EADDRINUSE lets try doing the
      // same thing, just with next port.
      //

      self.removeListener('listening', onListen);

      //
      // We can safely restore these listeners here. We're going to call
      // `ourFunction`, so they will be removed again anyway.
      //
      restoreErrorListeners();
      restoreListeningListeners();

      if (err.code !== 'EADDRINUSE' && err.code !== 'EACCES') {
        try { self.close() } 
        catch (ex) { }
        
        self.emit('error', err);
      }
      else {
        ourListen.call(self, '0.0.0.0', 0, addressType, desired);
      }
    }

    self.once('listening', onListen);
    self.once('error', onError);

    //
    // Call original _listen2 function.
    //
    process.nextTick(function () {
      _listen2.call(self, address, port, addressType);
    });
  };
};

//
// Setup the valid `nodeVersion` for all of the 
// monkey patches to `require('net')`.
//
module.exports._listen2.nodeVersion = '0.5.x || 0.6.x || 0.7.x || 0.8.x';
module.exports._doListen.nodeVersion = '0.4.x';

