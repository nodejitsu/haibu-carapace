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
    script =  path.join(jail, 'server.js'),
    argv = [],
    PORT = 5060;
    
vows.describe('carapace/run/process').addBatch({
  "When using haibu-carapace": {
    "and spawning `/.server.js` in a separate process": helper.assertSpawn(PORT, script, argv, {
      "should correctly start the HTTP server": {
        topic: function (child) {
          var that = this;
          request({ uri: 'http://localhost:1337' }, function () {
            child.kill();
            that.callback.apply(null, arguments);
          });      
        },
        "that responds with a cwd inside the app root": function (err, res, body) {
          assert.isNull(err);
          assert.equal(res.statusCode, 200);
          assert.equal(body, process.cwd());
        }
      }
    })
  }
}).export(module);
