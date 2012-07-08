/*
 * net-dolisten-test.js: Basic tests for the lib/net.js module
 *
 * (C) 2011 stolsma
 * MIT LICENCE
 *
 */

var assert = require('assert'),
    path = require('path'),
    fork = require('child_process').fork,
    vows = require('vows'),
    helper = require('../helper/macros.js'),
    carapace = require('../../lib/carapace');

var script = path.join(__dirname, '..', 'fixtures', 'multi-server.js'),
    testPort = 8000,
    argv = ['--plugin', 'net', script];

vows.describe('carapace/net/dolisten').addBatch({
  "When using haibu-carapace": {
    "spawning the server-dolisten.js script the child carapace": {
      topic: function () {
        var that = this,
            result,
            child;
            
        result = {
          events: [],
          exitCode: -1
        };
            
        child = fork(carapace.bin, argv, { silent: true });
        child.on('exit', function (code) {
          result.exitCode = code;
          // process all events before asserting
          process.nextTick(function () {
            that.callback(null, result, child);
          });
        });

        child.on('message', function onPort (info) {
          info.event == 'port' && result.events.push({
            event: info.event,
            info: info.data
          });
        });
      },
      "should exit": {
        topic: function (info, child) {
          this.callback(null, info, child);
        },
        "with the correct exit code": function (_, info, child) {
          assert.equal(info.exitCode, 0);
        },
        "and 3x emit the `port` event with the correct port": function (_, info, child) {
          var desired = testPort;
              
          assert.equal(info.events.length, 3);
          info.events.forEach(function (event, index) {
            assert.equal(event.info.desired, desired);
          });
        }
      }
    }
  }
}).export(module);
