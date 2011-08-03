/*
 * use-test.js: Basic tests for the carapace module
 *
 * (C) 2011 Nodejitsu Inc
 * MIT LICENCE
 *
 */
 
var assert = require('assert'),
    vows = require('vows'),
    helper = require('../helper/macros.js'),
    carapace = require('../../lib/carapace');

var PORT = 5050;
    
vows.describe('carapace/simple/use').addBatch({
  "When using haibu-carapace":  helper.assertListen(PORT, {
    "use chdir plugins" : helper.assertUse(['chdir'], {
      "and use chroot and heartbeat" : helper.assertUse(['chroot', 'heartbeat'])
    })
  })
}).export(module);
