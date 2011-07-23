/*
 * simple-test.js: Basic tests for the carapace module
 *
 * (C) 2011 Nodejitsu Inc
 * MIT LICENCE
 *
 */
 
var assert = require('assert'),
    vows = require('vows'),
    carapace = require('../lib/carapace');
    
vows.describe('carapace/simple').addBatch({
  "When using haibu-carapace": {
    "the listen() method": {
      topic: function () {
        var that = this;
        
        //
        // This is a test workaround for `hook.io@0.5.1`
        //
        carapace.on('hook::listening', function () {
          process.nextTick(that.callback.bind(null, null));
        });
        carapace.listen();
      },
      "should update the internal state of the carapace": function (_, name) {
        assert.isTrue(carapace.listening);
      }
    }
  }
}).export(module);