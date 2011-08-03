/*
 * use-custom-plugin-test.js: Tests to ensure that custom-plugins load correctly
 *
 *  (C) 2011 Nodejitsu Inc.
 *
 */
 
var assert = require('assert'),
    path = require('path'),
    vows = require('vows'),
    helper = require('../helper/macros.js'),
    carapace = require('../../lib/carapace');

var PORT = 5050;
    
vows.describe('carapace/simple/use-custom-plugin').addBatch({
  "When using haibu-carapace":  helper.assertListen(PORT, {
    "a custom plugin" : {
      //"with an absolute path": helper.assertUse(path.join(__dirname, '..', 'fixtures', 'custom.js')),
      "with a relative path": helper.assertUse('../fixtures/relative.js')
    }
  })
}).export(module);
