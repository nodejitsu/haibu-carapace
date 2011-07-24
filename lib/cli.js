/*
 * cli.js: wrapper around `optimist`, follow hook.io convention
 *
 *  (C) 2011 Nodejitsu Inc.
 *
 */

var path = require('path'),
    optimist = require('optimist');

var defaultOptions = {};

defaultOptions.debug = {
  description : 'Indicate if carapace is in debug mode',
  boolean : true,
  default : false
};

defaultOptions.plugins = {
  description : 'Directory where all the plugins are located',
  string : true,
  default : path.join(__dirname, 'plugins');
}

defaultOptions['carapace-port'] = {
  description : '',
  number : true,
  default : 5050
};

//
// Default Options to PLUGINS
//

defaultOptions['chroot'] = {
  description : 'Path to the chroot jail to use',
  string : true,
  required : false
};

defaultOptions['chdir'] = {
  description : 'Default path to change to in the jail',
  string : true,
  required : false,
  default: '.'
};

defaultOptions['heartbeat'] = {
  description : 'Default interval for heartbeat beats',
  number : true,
  required : false,
  default : 1000
}


//
// For exporting out
//

exports.options = function (options) {
  return optimist.options(defaultOptions).options(options);
};

Object.defineProperty(exports, 'argv', {
  get : function() {
    return optimist.options(defaultOptions).argv;
  }
});
