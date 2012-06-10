/*
 * use-test.js: Basic tests for the drone module
 *
 * (C) 2011 Nodejitsu Inc
 * MIT LICENCE
 *
 */
 
var assert = require('assert'),
    vows = require('vows'),
    helper = require('../helper/macros.js'),
    drone = require('../../lib/drone');

vows.describe('drone/simple/use-plugins').addBatch({
  "When using haibu-drone":  {
    "load up chdir, chroot, heartbeat plugins" : helper.assertUse(['chdir', 'chroot', 'heartbeat'], {
      "and running the heartbeat plugin" : {
        topic : function () {
          drone.once('heartbeat', this.callback.bind(drone, null));
          drone.heartbeat();
        },
        "should see a heartbeat event" : function (_, event, data) {
          assert.isString(drone.event);
          assert.equal(drone.event, 'heartbeat');
        }
      }
    })
  }
}).export(module);
