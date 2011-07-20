var libev = require('./libev');
var net = require('net');
var dnode = require('dnode');
var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
module.exports = carapace = new EventEmitter();

for (var k in carapace) {
  carapace[k] = carapace[k];
}

//
// Plugins list
//
carapace.plugins = {};

var plugins = fs.readdirSync(path.join(__dirname, '../lib/plugins'));
plugins.forEach(function (name) {
  carapace.plugins[name.replace(/\.js$/, '')] = path.join(__dirname, '../lib/plugins', name);
});

carapace.wrap = function wrap (bridgeServer, done) {
  if (typeof bridgeServer === 'string' || typeof bridgeServer === 'number') {
    var bridgePath = bridgeServer
    bridgeServer = net.createServer();
    bridgeServer.listen(bridgePath, function () {
      var bridge = new dnode(carapace);

      bridge.listen(bridgeServer);
      bridgeServer.on('connection', function (conn) {
        libev.Unref();
        conn.on('close', function () {
          libev.Ref();
          carapace.emit('carapace:connection:close');
        });
        carapace.emit('carapace:connection:start');
      });
      
      carapace.on('plugin', function (toRequire, done) {
        try {
          require(toRequire)(carapace);
        }
        catch (ex) {
          carapace.emit('carapace:plugin:error', ex);
          if (done) {
            return done(ex);
          }
        }
        carapace.emit('carapace:plugin:loaded', toRequire);

        return done ? done() : null;
      });
      
      var running = false;

      carapace.on('run', function (argv, done) {
        if (running) {
          return done 
            ? done(new Error('Cannot spawn a new script, one is already running.'))
            : null;
        }
        
        libev.Unref();
        running = true;
        argv[0] = fs.realpathSync(require.resolve(path.join(process.cwd(), argv[0])));
        
        for (var i = 0; i < argv.length;) {
          var item = argv[i];
          process.argv[++i] = item;
        }

        process.argv.splice(i, i - process.argv.length);
        require('module').Module._cache = {};

        //
        // Next tick to prevent a leak from arguments
        //
        process.nextTick(function () {
          require('module').Module.runMain();
        });

        carapace.emit('carapace:running');

        return done ? done() : null;
      });
      
      carapace.emit('carapace:ready');
      
      if (done) {
        done();
      }
    });
  }
}
