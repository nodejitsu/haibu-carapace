function toPort(x) {
  return (x = Number(x)) >= 0 ? x : false;
}

module.exports = function (carapace,done) {
  var net = require('net');
  var netListen = net.Server.prototype._doListen;
  var binding = process.binding('net');
  var bindingBind = binding.bind;

  function registerPort(desiredPort, actualPort) {
    carapace.emit('proxy:map',desiredPort,actualPort);
  }
  //
  // Bind clobber
  // fd, port | unix, addr?
  //
  // Used to prevent a socket being bound to a port and instead use a different port
  //
  binding.bind = function bind() {
    var fd = arguments[0];
    var port = arguments[1];
    port = toPort(port);
    if(!port) {
      return bindingBind.apply(this,arguments);
    }
    var desiredPort = port;
    arguments[1] = undefined;
    var result = bindingBind.apply(this,arguments);
    var actualPort = binding.getsockname(fd).port;
    registerPort(desiredPort,actualPort);
    return result;
  }
  
  //
  // Server _doListen clobber
  //
  // This needs to be done because listen uses a cached bind
  // Listening on a port should be deferred to any port and a port mapping should be emitted
  //
  net.Server.prototype._doListen = function _doListen() {
    var port = arguments[0];
    port = toPort(port);
    if(!port) {
      return netListen.apply(this,arguments);
    }
    var desiredPort = port;
    var result = netListen.apply(this,arguments);
    var actualPort = this.address().port;
    registerPort(desiredPort,actualPort);
    return result;
  }
  
}
