/*
 * use-test.js: Basic tests for the drone module
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
    drone = require('../../lib/drone');

var script = path.join(__dirname, '..', '..', 'examples', 'chroot-jail', 'server.js');
    
vows.describe('drone/spawn/local').addBatch({
  "When using haibu-drone": {
    "and running `./server.js` with no plugins": helper.assertRun(script, null, {
      "should set the correct exports on drone._module": function (_, _) {
        assert.equal(drone._module.exports.port, 1337);
      },
      "should emit the `port::bound` event": {
        topic: function () {
          drone.on('port::bound', this.callback.bind(drone, null));
        },
        "with the correct port": function (err, info) {
          assert.equal(drone.event, 'port::bound');
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
}).export(module);
