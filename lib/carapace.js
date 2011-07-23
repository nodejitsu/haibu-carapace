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
    hookio = require('hook.io'),
    evref = require('../build/default/evref');
    
var carapace = module.exports = new hookio.Hook(),
    _listen  = carapace.listen;

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
carapace.listen = function listen (options, callback) {
  if (carapace.listening) {
    throw new Error('Cannot start carapace server that is already running');
  }
  
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  this.on('connection::open', function (conn) {
    //
    // Dereference `libev` so that this connection does not
    // keep the event loop alive.
    //
    evref.unref();
    
    conn.on('close', function () {
      evref.ref();
      carapace.emit('carapace::connection::close');
    });
    
    carapace.emit('carapace::connection::open', conn);
  });
  
  _listen.call(this, options, function () {
    //
    // Remark: No need to emit the `listening` event
    // here, it has already been emitted by `_listen`.
    //
    carapace.listening = true;
    if (callback) {
      callback();
    }
  });
  
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
      //
      // todo make this more flexible
      // this requires absolute path or node_module
      //
      require(plugin)(carapace);
      carapace.emit('carapace::plugin::loaded', plugin);
    }
    catch (ex) {
      carapace.emit('carapace::plugin::error', plugin, ex);
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
  
  //
  // Rewrite `process.argv` so that `Module.runMain()`
  // will transparently locate and run the target script 
  // and it will be completely unaware of the carapace.
  //
  argv[0] = fs.realpathSync(require.resolve(argv[0]));
  for (var i = 0; i < argv.length;) {
    var item = argv[i];
    process.argv[++i] = item;
  }

  process.argv.splice(i, i - process.argv.length);
  require('module').Module._cache = {};

  console.log(arguments);
  process.nextTick(function () {
    //
    // Next tick to prevent a leak from arguments
    //
    require('module').Module.runMain();
  });

  carapace.running = true;
  carapace.emit('carapace::running');

  if (callback) {
    callback();
  }
  
  return carapace;
};
