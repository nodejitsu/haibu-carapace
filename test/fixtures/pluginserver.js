/*
 * pluginserver.js: Test fixture for a custom plugin in haibu-carapace that starts an HTTP server .
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var http = require('http');

var enabled = false;
 
module.exports = function pluginserver (carapace) {
  if (!carapace.pluginserver) {
    carapace.pluginserver = function (args, done) {
      if (enabled) {
        return done();
      }
      
      var port = 1337, server;
      
      server = http.createServer(function (req, res) {
        res.end('from-pluginserver');
      });
      
      //
      // Append the port of the plugin server to `carapace.ports.ignore`
      // so that `haibu-carapace` will not emit `carapace::port` events when
      // it attempts to listen.
      //
      carapace.ports.ignore.push(port);
      server.listen(port, function () {
        if (done) {
          done();
        }      
      });
    };
  }
};