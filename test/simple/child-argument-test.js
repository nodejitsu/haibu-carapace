/*
 * child-argument-test.js: Basic child argument rewrite tests
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

var script = path.join(__dirname, '..', 'fixtures' ,'checkchildargs.js'),
    testPort = 8000,
    checkargs = ['argument', '-a', 'aargument', '--test', 'testargument'];
    argv = [script];

vows.describe('carapace/simple/child-argument').addBatch({
  "When using haibu-carapace": {
    "spawning the checkchildargs.js script via the child carapace": {
      topic: function () {
        var that = this,
            child,
            result;
            
        result = {
          arguments: '',
          exitCode: -1
        };
        
        child = spawn(carapace.bin, argv.concat(checkargs));

        child.stdout.on('data', function (data) {
          result.arguments += data;
        });

        child.on('exit', function (code) {
          result.exitCode = code;

          //
          // Process all events before asserting
          //
          process.nextTick(function () {
            that.callback(null, result, child);
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
        "and correct client arguments": function (_, info, child) {
          var childargs = JSON.parse(info.arguments),
              resultScript,
              node,
              
          //
          // First two are reference to node and the script itself
          //
          node = childargs.splice(0, 1);
          resultScript = childargs.splice(0, 1);
          assert.equal(resultScript, script);
          assert.deepEqual(childargs, checkargs);
        }
      }
    }
  }
}).export(module);
