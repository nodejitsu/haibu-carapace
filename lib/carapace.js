/*
 * carapace.js: Top-level include for the haibu-carapace module.
 *
 * (C) 2011 Nodejitsu Inc.
 * MIT LICENCE
 *
 */
 
var fs = require('fs'),
    net = require('net'),
    path = require('path');
    events = require('eventemitter2'),
    hookio = require('hook.io');
    
var carapace = module.exports = new hookio.Hook(),
    _listen  = carapace.listen;
    
//
// Expose `evref` so that it can be used by `haibu-carapace` plugins
//
var evref = carapace.evref = require('../build/default/evref');

//
// Expose the `cli` module for default options
// and liberal arguments parsing
//
carapace.cli = require('./cli');
carapace.bin = path.join(__dirname, '..', 'bin', 'carapace');

//
// Require the `net` module for observing 
// relevant events and functions in the core
// node.js `net` module
//
require('./net');

//
// Plugins list exposed through path names so that they
// can be later required by `carapace.plugin()` or `carapace:plugin` events.
//
carapace.plugins = {};

//
// Internal state for managing various carapace operations:
// * carapace.running: Value indicating if the target script has started.
// * carapace.listening: Value indicating if the carapace `dnode` server has started.
//
carapace.running = false;
carapace.listening = false;

//
// Store a set of reserved ports for which the `net.js` implementation
// should actually throw an error, or not emit the `carapace::port` event.
//
carapace.ports = {
  throw: [carapace['hook-port'] || carapace.defaults['hook-port']],
  ignore: []
};

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
      carapace.emit('carapace::connection::close', { id: carapace.id });
    });
    
    carapace.emit('carapace::connection::open', {
      id: carapace.id, 
      connection: conn
    });
  });
  
  _listen.call(this, options, function (err) {
    //
    // Remark: No need to emit the `listening` event
    // here, it has already been emitted by `_listen`.
    //
    if (!err) {
      carapace.listening = true;
    }
    
    if (callback) {
      callback(err);
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
      carapace.emit('carapace::plugin::loaded', {
        id: carapace.id, 
        plugin: plugin
      });
    }
    catch (ex) {
      carapace.emit('carapace::plugin::error', {
        id: carapace.id, 
        plugin: plugin, 
        error: ex
      });
    }
  });
  
  if (callback) {
    callback();
  }
  
  return carapace;
};

//
// ### function run (script, argv, callback)
// #### @script {string} Path to the script to run inside the carapace.
// #### @argv {Array} Arguments to rewrite into process.argv
// #### @callback {function} Continuation to respond to when complete.
// Runs the script in `argv[0]` with the rest of the arguments specified 
// in `argv` by transparently rewriting the current `process.argv`.
//
carapace.run = function (script, argv, override, callback) {
  var error;
      
  Array.prototype.slice.call(arguments).forEach(function (a) {
    switch (typeof(a)) {
      case 'function': callback = a; break;
      case 'string': script = a; break;
      case 'object': argv = a; break;
      case 'boolean': override = a; break;
    }
  });
  
  if (!script) {
    error = new Error('Cannot spawn a script with no path.');
  }
  else if (carapace.running) {
    error = new Error('Cannot spawn a new script, one is already running.');
  }
  
  if (error) {
    return callback
      ? callback(error)
      : carapace.emit('carapace::error', { id: carapace.id, error: error });
  }
  
  //
  // Rewrite `process.argv` so that `Module.runMain()`
  // will transparently locate and run the target script 
  // and it will be completely unaware of the carapace.
  //
  carapace.cli.rewrite(script, argv, override);

  //
  // Clear the module cache so anything required by `haibu-carapace`
  // is reloaded as necessary.
  //
  require('module').Module._cache = {};
  
  //
  // Setup `carapace.wrapped` contain information about
  // the wrapped script, then 
  //
  carapace.wrapped = {
    script: script,
    argv: argv
  };

  process.nextTick(function () {
    //
    // Next tick to prevent a leak from arguments
    //
    require('module').Module.runMain();
    carapace._module = process.mainModule;
    
    carapace.running = true;
    carapace.emit('carapace::running', { id: carapace.id });

    if (callback) {
      callback();
    }
  });
  
  return carapace;
};

//
// ### function load (script, callback)
// #### @script {string} Path to the script to run inside the carapace
//
carapace.load = function (script) {
  if (script[0] === '.') {
    throw new Error('Cannot load relative paths into carapace. Provide an absolute path')
  }
  
  var name = path.basename(script, '.js');
  
  if (carapace.plugins[name]) {
    // if we already have the plugin, 
    return carapace.plugins[name];
  }

  if (!~['/'].indexOf(script[0])) {
    //
    // If it is not a relative or absolute path, make it absolute
    // from the current `process.cwd()`.
    //
    script = path.join(process.cwd(), script);
  }

  carapace.plugins[name] = script;
  carapace.emit('carapace::plugin::loaded', script);
  
  return script;
};

//
// Setup the filenames for each of the default plugins 
//
fs.readdirSync(path.join(__dirname, 'plugins')).forEach(function (name) {
  carapace.load(path.join(__dirname, 'plugins', name));
});