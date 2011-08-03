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

var PORT = 5050;

var script = path.join(__dirname, '..', '..', 'examples', 'chroot-jail', 'server.js');
    
vows.describe('carapace/spawn/local').addBatch({
  "When using haibu-carapace": helper.assertListen(PORT, {
    "and running `./server.js` with no plugins": helper.assertRun(script, null, {
      "should set the correct exports on carapace._module": function (_, _) {
        assert.equal(carapace._module.exports.port, 1337);
      },
      "should emit the `carapace::port` event": {
        topic: function () {
          carapace.on('carapace::port', this.callback.bind(carapace, null));
        },
        "with the correct port": function (err, info) {
          assert.equal(carapace.event, 'carapace::port');
          assert.equal(info.port, 1337);
        },
        "should correctly start the HTTP server": {
          topic: function () {
            request({ uri: 'http://localhost:' + carapace._module.exports.port }, this.callback);      
          },
          "that responds with a cwd": function (err, res, body) {
            assert.equal(body, process.cwd());
          }
        }
      }
    })
  })
}).export(module);
