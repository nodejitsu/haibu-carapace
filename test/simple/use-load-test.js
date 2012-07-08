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

vows.describe('carapace/simple/use').addBatch({
  "When using haibu-carapace": {
    "use chdir plugins" : helper.assertUse(['chdir'], {
      "and use heartbeat" : helper.assertUse(['heartbeat'])
    })
  }
}).export(module);
