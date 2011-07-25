/*
 * simple-test.js: Basic tests for the carapace module
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
    
vows.describe('carapace/simple/listen').addBatch({
  "When using haibu-carapace":  helper.assertListen(PORT)
}).export(module);
