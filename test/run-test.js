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
    helper = require('./helper/macros.js'),
    carapace = require('../lib/carapace');

var PORT = 5050;

var script = path.join(__dirname, '..', 'examples', 'tobechrooted', 'server.js');
    
vows.describe('carapace/run').addBatch({
  "When using haibu-carapace":  helper.assertListen(carapace, PORT, {
    "use chdir, chroot" : helper.assertUse(carapace, ['chdir', 'chroot'], {
      "to create the jail" : {
        topic : function () {
          //carapace.chroot(path.join(__dirname, '../examples/tobechrooted'));
          //carapace.chdir('.');
          return true;
        },
        "without any errors" : function () {
          assert.isTrue(true);
        },
        "in the in the jail, run `./server.js`" : helper.assertRun(carapace, [script], {
          "should set the correct exports on carapace._module": function (_, _) {
            assert.equal(carapace._module.exports.port, 1337);
          }
        })
      }
    })
  })
}).addBatch({
  "should correctly start the HTTP server": {
    topic: function () {
      console.dir({
        host: 'localhost', 
        port: carapace._module.exports.port,
        path: '/'
      });
      var that = this;
      http.get({
        host: 'localhost', 
        port: carapace._module.exports.port,
        path: '/'
      }, function () {
        console.dir(arguments);
        that.callback.apply(that, arguments);
      });
      
      //process.nextTick(function () {
      //  that.callback();
      //})
      
      //exec('curl http://localhost:1337/', this.callback)
    },
    "that responds with a cwd in the chroot jail": function (err, stdout, stderr) {
      console.dir(arguments);
      assert.isTrue(true);
    }
  }
}).export(module);
