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

var jail = path.join(__dirname, '..', '..', 'examples', 'app'),
    custom = path.join(__dirname, '..', 'fixtures', 'custom.js'),
    options;
    
options = {
  port: 5060,
  script: path.join(jail, 'server.js'),
  argv: ['--plugin', custom, '--plugin', 'heartbeat'],
  cwd: process.cwd(),
  keepalive: true
};
    
vows.describe('carapace/spawn/custom-plugin').addBatch({
  "When using haibu-carapace": {
    "spawning a child carapace with a custom plugin": helper.assertParentSpawn(options, {
      "after the plugin is loaded": {
        topic: function (info, child) {
          var that = this;
          child.once('message', function (info) {
            if (info.event === 'custom') {
              that.callback(null, child, info);
            }
          });
        },
        "should emit the `carapace::custom` event": function (_, child, info) {
          assert.isTrue(info.data.custom);
          child.kill();
        }
      }
    })
  }
}).export(module);
