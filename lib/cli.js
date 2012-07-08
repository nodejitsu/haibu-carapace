/*
 * cli.js: wrapper around `optimist`
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    optimist = require('optimist');

var defaultOptions = exports.defaultOptions = {
  debug: {
    description: 'Indicate if carapace is in debug mode',
    boolean: true,
    default: false
  },
  plugin: {
    description: 'Indicate if carapace should use the specified plugin',
    string: true
  },
  setuid: {
    description: 'User to run as',
    string: true
  },
  chdir: {
    description: 'Default path to change to in the jail',
    string: true,
    default: '.'
  },
  heartbeat: {
    description : 'Default interval for heartbeat beats',
    number: true,
    default: 1000
  }
};

//
// For exporting out
//
exports.options = function (options, argv) {
  options = options || {};
  return (argv ? optimist(argv) : optimist).options(defaultOptions).options(options);
};

exports.extract = function (options, script) {
  //
  // Get current process arguments in clean array. If script is not given
  // then get the first non option argument from process.argv
  //
  var argv = [].concat(process.argv);
  script = script || exports.options(options).argv._[0];

  //
  // Remove everything up to and including the script.
  //
  return argv.splice(argv.indexOf(script) + 1);
};

exports.rewrite = function (script, argv, override) {
  argv = argv || [];

  if (!Array.isArray(argv)) {
    throw new Error('Cannot rewrite unparsed arguments');
  }

  if (!~['.', '/'].indexOf(script[0])) {
    //
    // If it is not a relative or absolute path, make it absolute
    // from the current `process.cwd()`.
    //
    script = path.join(process.cwd(), script);
  }

  script = fs.realpathSync(require.resolve(script));
  var insert = [script].concat(argv);

  //
  // Remove all arguments that would be overwritten by
  // the new [script, argv]
  //
  if (!override) {
    process.argv.splice(1, insert.length);
    process.argv.splice.apply(process.argv, [1, -1].concat(insert));
    return;
  }

  process.argv = [process.argv[0]].concat(insert);
};

exports.argv = function (argv) {
  return exports.options({}, argv).argv;
};
