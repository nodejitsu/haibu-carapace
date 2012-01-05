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
    carapace = require('../../lib/carapace');

vows.describe('carapace/simple/use-custom-plugin').addBatch({
  "When using haibu-carapace": {
    "a custom plugin" : {
      "with an absolute path": helper.assertUse([path.join(__dirname, '..', 'fixtures', 'custom.js')], {
        "after the plugin is loaded": {
          topic: function () {
            carapace.custom();
            carapace.once('custom', this.callback.bind(carapace, null));
          },
          "should emit the `custom` event": function (_, info) {
            assert.isTrue(info.custom);
          }
        }
      }),
      "with a relative path": function () {
        assert.throws(function () { carapace.load('../fixtures/relative.js') });
      }
    }
  }
}).export(module);
