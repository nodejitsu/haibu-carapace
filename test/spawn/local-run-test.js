/*
 * use-test.js: Basic tests for the carapace module
 *
 * (C) 2011 Nodejitsu Inc
 * MIT LICENCE
 *
 */
 
var assert = require('assert'),
    path = require('path'),
    exec = require('child_process').exec,
    http = require('http'),
    request = require('request'),
    vows = require('vows'),
    helper = require('../helper/macros.js'),
    carapace = require('../../lib/carapace');

var script = path.join(__dirname, '..', '..', 'examples', 'app', 'server.js');
    
vows.describe('carapace/spawn/local').addBatch({
  "When using haibu-carapace": {
    "with `net` plugin": {
      topic: function () {
        carapace.use(path.resolve(__dirname, '..', '..', 'lib', 'plugins', 'net'));
        carapace.net([], this.callback);
      },
      "and running `./server.js`": helper.assertRun(script, null, {
        "should set the correct exports on carapace._module": function (_, _) {
          assert.equal(carapace._module.exports.port, 1337);
        },
        "should emit the `port` event": {
          topic: function () {
            carapace.on('port', this.callback.bind(carapace, null));
          },
          "with the correct port": function (err, info) {
            assert.equal(carapace.event, 'port');
            assert.equal(info.desired, 1337);
          },
          "should correctly start the HTTP server": {
            topic: function (info) {
              request({ uri: 'http://localhost:' + info.port }, this.callback);
            },
            "that responds with a cwd": function (err, res, body) {
              assert.equal(body, process.cwd());
            }
          }
        }
      })
    }
  }
}).export(module);
