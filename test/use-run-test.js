/*
 * use-test.js: Basic tests for the carapace module
 *
 * (C) 2011 Nodejitsu Inc
 * MIT LICENCE
 *
 */
 
var assert = require('assert'),
    vows = require('vows'),
    helper = require('./helper/macros.js'),
    carapace = require('../lib/carapace');

var PORT = 5050;
    
vows.describe('carapace/use-plugins').addBatch({
  "When using haibu-carapace":  helper.assertListen(carapace, PORT, {
    "load up chdir, chroot, heartbeat plugins" : helper.assertUse(carapace, ['chdir', 'chroot', 'heartbeat'], {
      "and running the heartbeat plugin" : {
        topic : function () {
          carapace.on('carapace::heartbeat', this.callback.bind(null,null));
          carapace.heartbeat();
        },
        "should see a carapace::heartbeat event" : function (_, event, data) {
          assert.isString(event);
          assert.equal(event, 'carapace::heartbeat');
        }
      }
    })
  })
}).export(module);
