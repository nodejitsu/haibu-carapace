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
    
var carapace = module.exports = new events.EventEmitter2();

//
// Copy over prototype methods from carapace so that
// `dnode` will pick up on them in IPC.
//
for (var k in carapace) {
  carapace[k] = carapace[k];
}

//
// Plugins list exposed through path names so that they
// can be later required by `carapace.plugin()` or `carapace:plugin` events.
//
carapace.plugins = {};
fs.readdirSync(path.join(__dirname, '../lib/plugins')).forEach(function (name) {
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
// ### function listen (target, callback)
// #### @target {string|number} Socket path or port to listen on.
// #### @callback {function} Continuation to respond to when complete.
// Starts the carapace server on the specified `target` socket or port.
//
carapace.listen = function listen (target, callback) {
  if (carapace.listening) {
    throw new Error('Cannot start carapace server that is already running');
  }
  
  if (!target || (typeof target !== 'string' && typeof target !== 'number')) {
    throw new Error('Cannot start carapace server without a port or socket path.');
  }

  carapace.server = net.createServer();
  carapace.server.listen(target, function () {
    //
    // Create the `dnode` bridge for the carapace.
    //
    carapace.bridge = new dnode(carapace);
    carapace.bridge.listen(carapace.server);
    
    carapace.server.on('connection', function (conn) {
      //
      // Dereference `libev` so that this connection does not
      // keep the event loop alive.
      //
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

//
// ### function use (plugins, callback)
// #### @plugins {string|Array} List (or single) plugin add to the carapace.
// #### @callback {function} Continuation to respond to when complete.
// Enables the specified `plugins` in the carapace.
//
carapace.use = function (plugins, callback) {
  if (!Array.isArray(plugins)) {
    plugins = [plugins];
  }
  
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

//
// ### function run (argv, callback)
// #### @argv {Array} Arguments to rewrite into process.argv
// #### @callback {function} Continuation to respond to when complete.
// Runs the script in `argv[0]` with the rest of the arguments specified 
// in `argv` by transparently rewriting the current `process.argv`.
//
carapace.run = function (argv, callback) {
  var error;
  
  if (carapace.running) {
    error = new Error('Cannot spawn a new script, one is already running.');

    return callback
      ? callback(error)
      : carapace.emit('error', error);
  }
  
  if (argv[0][0] !== '/') {
    //
    // If the path supplied is not absolute then prepend
    // `process.cwd()` to it.
    //
    argv[0] = path.join(process.cwd(), argv[0]);
  }
  
  //
  // Dereference `libev` so that this connection
  // does not keep the event loop alive
  //
  evref.unref();
  
  carapace.running = true;
  argv[0] = fs.realpathSync(require.resolve(argv[0]));
  
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
