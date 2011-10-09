/*
 * net-dolisten-test.js: Basic tests for the lib/net.js module
 *
 * (C) 2011 stolsma
 * MIT LICENCE
 *
 */

var assert = require('assert'),
    path = require('path'),
    spawn = require('child_process').spawn,
    vows = require('vows'),
    helper = require('../helper/macros.js'),
    carapace = require('../../lib/carapace');

var script = path.join(__dirname, '..', 'fixtures' ,'multi-server.js'),
    IOPORT = 5060,
    testPort = 8000,
    argv = ['--hook-port', IOPORT, '--hook-name', 'carapace', script];

vows.describe('carapace/net/dolisten').addBatch({
  "When using haibu-carapace": helper.assertListen(IOPORT, {
    "spawning the server-dolisten.js script the child carapace": {
      topic: function () {
        var that = this,
            child,
            result = {
              events: [],
              exitCode: -1
            };
        child = spawn(carapace.bin, argv);

        child.stdout.on('data', function (data) {
          process.stdout.write(data);
        });

        child.stderr.on('data', function (data) {
          process.stdout.write(data);
        });

        child.on('exit', function (code) {
          result.exitCode = code;
          // process all events before asserting
          process.nextTick(function () {
            that.callback(null, result, child);
          });
        });

        carapace.on('*::carapace::port', function onPort (info) {
          result.events.push({
            event: this.event,
            info: info
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
        "and 3x emit the `*::carapace::port` event with the correct port": function (_, info, child) {
          var desired = testPort,
              basePort = desired;
          assert.equal(info.events.length, 3);
          info.events.forEach(function (event) {
            assert.equal(event.info.port, basePort++);
            assert.equal(event.info.desired, desired);
          });
        }
      }
    }
  })
}).export(module);
