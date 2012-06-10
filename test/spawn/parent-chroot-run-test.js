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
    script =  '.server.js',
    argv = ['--plugin', 'chroot', '--plugin', 'chdir', '--chroot', jail, '--chdir', '/'];
    
    
vows.describe('drone/run').addBatch({
  "When using haibu-drone": {
    "spawning a child drone in a chroot jail": helper.assertParentSpawn({
      script: script,
      argv: argv,
      cwd: '/'
    })
  }
}).export(module);
