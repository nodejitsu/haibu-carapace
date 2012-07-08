/*
 * use-test.js: Basic tests for the carapace module
 *
 * (C) 2011 Nodejitsu Inc
 * MIT LICENCE
 *
 */
 
var assert = require('assert'),
    path = require('path'),
    request = require('request'),
    vows = require('vows'),
    helper = require('../helper/macros.js');

var jail = path.join(__dirname, '..', '..', 'examples', 'app'),
    custom = path.join(__dirname, '..', 'fixtures', 'pluginserver.js'),
    options,
    child;
    
options = {
  script: path.join(jail, 'server.js'),
  argv: ['--plugin', custom],
  cwd: process.cwd(),
  keepalive: true
};
    
vows.describe('carapace/spawn/custom-plugin').addBatch({
  "When using haibu-carapace": {
    "spawning a child carapace with a custom plugin": helper.assertParentSpawn(options, {
      "a request to the server started by pluginserver.js": {
        topic: function (info, _child) {
          child = _child;
          request({ uri: 'http://127.0.0.1:1337' }, this.callback.bind(this, null, child));
        },
        "should respond with `from-pluginserver`": function (_, child, err, res, body) {
          assert.isTrue(!err);
          assert.equal(body, 'from-pluginserver');
        },
        //
        // Remark: There is not a good way to do asynchronous teardown in vows
        // currently, so this context is merely a stop-gap for that.
        //
        "when everything is over": {
          topic: function () {
            setTimeout(this.callback, 200);
          },
          "kill the child process": function () {
            child.kill();
          }
        }
      }
    })
  }
}).export(module);
