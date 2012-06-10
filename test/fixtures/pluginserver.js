/*
 * pluginserver.js: Test fixture for a custom plugin in haibu-drone that starts an HTTP server .
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var http = require('http');

var enabled = false;
 
module.exports = function pluginserver (drone) {
  if (!drone.pluginserver) {
    drone.pluginserver = function (args, done) {
      if (enabled) {
        return done();
      }
      
      var port = 1337, server;
      
      server = http.createServer(function (req, res) {
        res.end('from-pluginserver');
      });
      
      //
      // Append the port of the plugin server to `drone.ports.ignore`
      // so that `haibu-drone` will not emit `drone::port` events when
      // it attempts to listen.
      //
      drone.ports.ignore.push(port);
      server.listen(port, function () {
        if (done) {
          done();
        }      
      });
    };
  }
};