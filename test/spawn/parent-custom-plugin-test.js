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

var jail = path.join(__dirname, '..', '..', 'examples', 'chroot-jail'),
    custom = path.join(__dirname, '..', 'fixtures', 'custom.js'),
    options;
    
options = {
  port: 5060,
  script: path.join(jail, 'server.js'),
  argv: ['--plugin', custom, '--plugin', 'heartbeat'],
  cwd: process.cwd(),
  keepalive: true
};
    
vows.describe('drone/spawn/custom-plugin').addBatch({
  "When using haibu-drone": {
    "spawning a child drone with a custom plugin": helper.assertParentSpawn(options, {
      "after the plugin is loaded": {
        topic: function (info, child) {
          var that = this;
          child.on('message', function (info) {
            if (info.event === 'custom') {
              that.callback(null, child, info);
            }
          });
        },
        "should emit the `drone::custom` event": function (_, child, info) {
          assert.isTrue(info.data.custom);
          child.kill();
        }
      }
    })
  }
}).export(module);
