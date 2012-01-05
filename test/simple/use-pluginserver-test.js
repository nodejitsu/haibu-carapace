/*
 * use-pluginserver-test.js: Tests to ensure that custom plugins which start servers load correctly
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */
 
var assert = require('assert'),
    path = require('path'),
    request = require('request'),
    vows = require('vows'),
    helper = require('../helper/macros.js'),
    carapace = require('../../lib/carapace');

vows.describe('carapace/simple/use-pluginserver').addBatch({
  "When using haibu-carapace": {
    "a custom plugin that starts a server" : helper.assertUse([path.join(__dirname, '..', 'fixtures', 'pluginserver.js')], {
      "a request to the server started by pluginserver.js": {
        topic: function () {
          var that = this;
          
          carapace.pluginserver(null, function () {
            request({ uri: 'http://localhost:1337' }, that.callback);
          });
        },
        "should respond with `from-pluginserver`": function (err, res, body) {
          assert.isTrue(!err);
          assert.equal(body, 'from-pluginserver');
        }
      }
    })
  }
}).export(module);
