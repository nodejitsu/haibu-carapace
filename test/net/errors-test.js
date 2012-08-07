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

var script = path.join(__dirname, '..', 'fixtures', 'eacces.js'),
    argv = ['--plugin', 'net', '--setuid', 'nobody', script];

vows.describe('carapace/net/dolisten').addBatch({
  "When using haibu-carapace": {
    "spawning the eacces.js script the child carapace": {
      topic: function () {
        var callback = this.callback;
        var that = this,
            result,
            child;
            
        result = {
          events: [],
          exitCode: -1
        };
            
        child = fork(carapace.bin, argv, { silent: true });

        child.on('message', function onPort (info) {
          if (info.event == 'port') {
            result.events.push({
               event: info.event,
               info: info.data
             });
            child.kill();
            callback(null, result);
          }
        });
      },
      "should exit": {
        topic: function (info, child) {
          this.callback(null, info, child);
        },
        "with the correct exit code": function (_, info, child) {
          assert.equal(info.exitCode, -1);
        },
        "and emit the `port` event with the correct port": function (_, info, child) {
          assert.equal(info.events.length, 1);
          info.events.forEach(function (event, index) {
            assert.equal(event.info.addr, '0.0.0.0');
            assert.equal(event.info.desired, 80);
            assert.equal(event.info.port, 1024);
          });
        }
      }
    }
  }
}).export(module);
