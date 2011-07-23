/*
 * use-test.js: Basic tests for the carapace module
 *
 * (C) 2011 Nodejitsu Inc
 * MIT LICENCE
 *
 */
 
var assert = require('assert'),
    vows = require('vows'),
    helper = require('./helper/macros.js'),
    carapace = require('../lib/carapace');

var PORT = 5050;
    
vows.describe('carapace/simple').addBatch({
  "When using haibu-carapace":  helper.assertListen(carapace, PORT, {
    "and if we load up chdir plugins" : helper.assertUse(carapace, 'chdir', {
      "we should be able to load more plugins" : helper.assertUse(carapace, ['chroot', 'heartbeat'], {
        "we should beable to chroot and chdir" : function () {
          carapace.chroot('../example/tobechrooted');
          carapace.chdir('.');
          //
          // todo is there a better thing to do here?
          //
          return true;
        },
        "without any errors" : function () {
          assert.isTrue(true);
        },
        "and then we should be able to run a simple server" : helper.assertRun(carapace, ['./server.js'])
        })
    })
  })
}).export(module);
