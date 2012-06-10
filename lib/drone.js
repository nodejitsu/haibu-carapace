/*
 * drone.js: Top-level include for the haibu-drone module.
 *
 * (C) 2011 Nodejitsu Inc.
 * MIT LICENCE
 *
 */

var fs = require('fs'),
    net = require('net'),
    path = require('path'),
    colors = require('colors'),
    utile = require('utile'),
    events = require('eventemitter2');

var drone = module.exports = new events.EventEmitter2({
  delimeter: '::',
  wildcard: true
});

if (process.send) {
  drone.send = process.send;
  delete process.send;
}

drone.debug = false;

drone.log = function (data) {

  //
  // Simple `EventEmitter` over `child_process.fork`.
  //
  if (drone.send) {
    drone.send(data);
  }

  if (drone.debug) {
    console.log('info: ' + utile.pad(data.event, 18) + ' data: ' + utile.pad(JSON.stringify(data.data), 20));
  }

};

drone.onAny(function (data) {
  drone.log({ event: this.event, data: data, drone: { pid: drone.pid }});
});

//
// Cache the version of node running in case a user-space
// script attempts to overwrite it;
//
var nodeVersion = process.version;

//
// Require the `net` module for observing and overriding
// relevant events and functions in the core
// node.js `net` module
// Do the require prior to any chroot or chdir
// Only override once all plugins have been loaded
//
var overrideNet = require('./net').getOverride(nodeVersion);

//
// Expose the `cli` module for default options
// and liberal arguments parsing
//
drone.cli = require('./cli');
drone.bin = path.join(__dirname, '..', 'bin', 'drone');
drone.argv = [];

//
// Set the drone id to something unique, like it's process id
//
drone.id = process.pid;
//
// Plugins list exposed through path names so that they
// can be later required by `drone.plugin()` or `drone:plugin` events.
//
drone.plugins = {};

//
// Internal mapping of server instances to
// ports that have been mapped via `.listen()`.
//
drone.servers = {};

//
// Internal state for managing various drone operations:
// * drone.running: Value indicating if the target script has started.
// * drone.listening: Value indicating if the drone `dnode` server has started.
//
drone.running = false;
drone.listening = false;

//
// Store a set of reserved ports for which the `net.js` implementation
// should actually throw an error, or not emit the `drone::port` event.
//
drone.ports = {
  throw: [],
  ignore: []
};

//
// ### function use (plugins, callback)
// #### @plugins {string|Array} List (or single) plugin add to the drone.
// #### @callback {function} Continuation to respond to when complete.
// Enables the specified `plugins` in the drone.
//
drone.use = function (plugins, callback) {
  if (!Array.isArray(plugins)) {
    plugins = [plugins];
  }

  plugins.forEach(function (plugin) {
    try {
      //
      // todo make this more flexible
      // this requires absolute path or node_module
      //
      require(plugin)(drone);
      drone.emit('plugin::started', {
        id: drone.id,
        plugin: plugin
      });
    }
    catch (ex) {
      drone.emit('plugin::error', {
        id: drone.id,
        plugin: plugin,
        error: ex
      });
    }
  });

  if (callback) {
    callback();
  }

  return drone;
};

drone.start = function (callback) {
  drone.on('drone::ready', callback);
  drone.run();
};

//
// ### function run (script, argv, callback)
// #### @script {string} Path to the script to run inside the drone.
// #### @argv {Array} Arguments to rewrite into process.argv
// #### @override {Boolean} When true remove current process.argv and replace
// with [script, argv]. If false remove all arguments that would be
// overwritten by the new [script, argv]
// #### @callback {function} Continuation to respond to when complete.
// Runs the script in `argv[0]` with the rest of the arguments specified
// in `argv` by transparently rewriting the current `process.argv`.
//
drone.run = function (override, callback) {
  var error;

  Array.prototype.slice.call(arguments).forEach(function (a) {
    switch (typeof(a)) {
      case 'function': callback = a; break;
      case 'boolean': override = a; break;
    }
  });

  if (!drone.script) {
    error = new Error('Cannot spawn a script with no path.');
  }
  else if (drone.running) {
    error = new Error('Cannot spawn a new script, one is already running.');
  }
  else if (!path.existsSync(drone.script)) {
    error = new Error('Cannot find script ' + drone.script);
  }

  if (error) {
    return callback
      ? callback(error)
      : drone.emit('error', { id: drone.id, error: error });
  }

  //
  // Rewrite `process.argv` so that `Module.runMain()`
  // will transparently locate and run the target script
  // and it will be completely unaware of the drone.
  //
  drone.cli.rewrite(drone.script, drone.argv, override);

  //
  // Start up the hooks for the net module
  //
  overrideNet();

  //
  // Clear the module cache so anything required by `haibu-drone`
  // is reloaded as necessary.
  //
  require('module').Module._cache = {};

  //
  // Setup `drone.wrapped` contain information about
  // the wrapped script, then
  //
  drone.wrapped = {
    script: drone.script,
    argv: drone.argv
  };

  process.nextTick(function () {

    //
    // Next tick to prevent a leak from arguments
    //
    require('module').Module.runMain();
    drone._module = process.mainModule;

    drone.on('port::bound', function(info) {
      drone.port = info.port;
      drone.emit('drone::listening', info.port);
      drone.emit('drone::ready');
    });

    drone.running = true;
    drone.emit('drone::running', {
      id: drone.id,
      script: drone.script,
      argv: drone.argv 
    });

    if (callback) {
      callback();
    }
  });

  return drone;
};

//
// ### function load (script, callback)
// #### @script {string} Path to the script to run inside the drone
//
drone.load = function (script) {
  if (script[0] === '.') {
    throw new Error('Cannot load relative paths into drone. Provide an absolute path');
  }

  var name = path.basename(script, '.js');

  if (drone.plugins[name]) {
    // if we already have the plugin,
    return drone.plugins[name];
  }

  if ('/' !== script[0]) {
    //
    // If it is not a relative or absolute path, make it absolute
    // from the current `process.cwd()`.
    //
    script = path.join(process.cwd(), script);
  }

  drone.plugins[name] = script;
  drone.emit('plugin::loaded', script);
  
  return script;
};

//
// Setup the filenames for each of the default plugins
//
fs.readdirSync(path.join(__dirname, 'plugins')).forEach(function (name) {
  drone.load(path.join(__dirname, 'plugins', name));
});
