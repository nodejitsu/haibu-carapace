/*
 * use-test.js: Basic tests for the drone module
 *
 * (C) 2011 Nodejitsu Inc
 * MIT LICENCE
 *
 */
 
var assert = require('assert'),
    vows = require('vows'),
    helper = require('../helper/macros.js'),
    drone = require('../../lib/drone');

vows.describe('drone/simple/use').addBatch({
  "When using haibu-drone": {
    "use chdir plugins" : helper.assertUse(['chdir'], {
      "and use chroot and heartbeat" : helper.assertUse(['chroot', 'heartbeat'])
    })
  }
}).export(module);
