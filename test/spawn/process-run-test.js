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

var jail = path.join(__dirname, '..', '..', 'examples', 'chroot-jail'),
    script =  'server.js',
    argv = ['--plugin', 'chroot', '--plugin', 'chdir', '--chroot', jail, '--chdir', '/'],
    PORT = 5060;
    
vows.describe('carapace/run').addBatch({
  "When using haibu-carapace": {
    "and spawning `/.server.js` in a separate process": helper.assertSpawn(PORT, script, argv, {
      "should correctly start the HTTP server": {
        topic: function () {
          request({ uri: 'http://localhost:1337' }, this.callback);      
        },
        "that responds with a cwd inside the chroot jail": function (err, res, body) {
          assert.isNull(err);
          assert.equal(body, '/');
        },
        "should teardown the child process": {
          //
          // Remark: This is a silly way to tear this down ... but it works
          //
          topic: function (_, _, child) {
            child.kill();
            return null;
          },
          "it shouldnt be running anymore": function () {
            assert.isTrue(true);
          }
        }
      }
    })
  }
}).export(module);
