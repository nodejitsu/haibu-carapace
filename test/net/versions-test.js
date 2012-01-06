/*
 * versions-test.js: Tests asserting that the correct override is set.
 *
 * (C) 2011 Nodejitsu Inc.
 * MIT LICENCE
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    carapace = require('../../lib/carapace'),
    net = require('../../lib/net');

function assertOverride(fnName) {
  var context = {};
  context['should respond with ' + fnName] = function () {
    var override = net.getOverride(this.context.name);
    assert.equal(override, net[fnName]);
  };
  
  return context;
}
    
vows.describe('carapace/net/multiple-versions').addBatch({
  "When using the haibu-carapace net module": {
    "the getOverride() method": {
      "v0.4.12": assertOverride('_doListen'),
      "v0.5.2": assertOverride('_listen2'),
      "v0.6.6": assertOverride('_listen2')
    }
  }
}).export(module);