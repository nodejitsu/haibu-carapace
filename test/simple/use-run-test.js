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

vows.describe('carapace/simple/use-plugins').addBatch({
  "When using haibu-carapace":  {
    "load up chdir, heartbeat plugins" : helper.assertUse(['chdir', 'heartbeat'], {
      "and running the heartbeat plugin" : {
        topic : function () {
          carapace.once('heartbeat', this.callback.bind(carapace, null));
          carapace.heartbeat();
        },
        "should see a heartbeat event" : function (_, event, data) {
          assert.isString(carapace.event);
          assert.equal(carapace.event, 'heartbeat');
        }
      }
    })
  }
}).export(module);
