/*
 * carapace.js: Top-level include for the haibu-carapace module.
 *
 * (C) 2011 Nodejitsu Inc.
 * MIT LICENCE
 *
 */
 
var events = require('eventemitter2'),
    net = require('net'),
    fs = require('fs'),
    path = require('path');
    dnode = require('dnode'),
    evref = require('../build/default/evref');
    
module.exports = carapace = new events.EventEmitter2();
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

//
// Internal state for managing various carapace operations:
// * carapace.running: Value indicating if the target script has started.
// * carapace.listening: Value indicating if the carapace `dnode` server has started.
//
carapace.running = false;
carapace.listening = false;

//
//
//
//
carapace.listen = function create (target, callback) {
  if (carapace.listening) {
    throw new Error('Cannot start carapace server that is already running');
  }
  
  if (!target || (typeof target !== 'string' && typeof target !== 'number')) {
    throw new Error('Cannot start carapace server without a port or socket path.');
  }

  carapace.server = net.createServer();
  carapace.server.listen(target, function () {
    var bridge = new dnode(carapace);
    bridge.listen(carapace.server);
    carapace.server.on('connection', function (conn) {
      evref.unref();
      conn.on('close', function () {
        evref.ref();
        carapace.emit('carapace:connection:close', conn);
      });
      carapace.emit('carapace:connection:start', conn);
    });
    
    carapace.emit('carapace:ready');
    
    if (callback) {
      callback();
    }
  });
  
  carapace.listening = true;
  return carapace;
};

carapace.use = function (plugins, callback) {
  
  plugins.forEach(function (plugin) {
    try {
      require(plugin)(carapace);
      carapace.emit('carapace:plugin:loaded', plugin);
    }
    catch (ex) {
      carapace.emit('carapace:plugin:error', plugin, ex);
    }
  });
  
  if (callback) {
    callback();
  }
  
  return carapace;
};

carapace.run = function (argv, callback) {
  var error;
  
  if (carapace.running) {
    error = new Error('Cannot spawn a new script, one is already running.');

    return callback
      ? callback(error)
      : carapace.emit('error', error);
  }
  
  evref.unref();
  carapace.running = true;
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

  if (callback) {
    callback();
  }
  
  return carapace;
};
