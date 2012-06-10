/*
 * use-custom-plugin-test.js: Tests to ensure that custom-plugins load correctly
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */
 
var assert = require('assert'),
    path = require('path'),
    vows = require('vows'),
    helper = require('../helper/macros.js'),
    drone = require('../../lib/drone');

vows.describe('drone/simple/use-custom-plugin').addBatch({
  "When using haibu-drone": {
    "a custom plugin" : {
      "with an absolute path": helper.assertUse([path.join(__dirname, '..', 'fixtures', 'custom.js')], {
        "after the plugin is loaded": {
          topic: function () {
            drone.custom();
            drone.once('custom', this.callback.bind(drone, null));
          },
          "should emit the `custom` event": function (_, info) {
            assert.isTrue(info.custom);
          }
        }
      }),
      "with a relative path": function () {
        assert.throws(function () { drone.load('../fixtures/relative.js') });
      }
    }
  }
}).export(module);
