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
    options;
    
options = {
  argv: [],
  script: script =  path.join(jail, 'server.js'),
  cwd: process.cwd()
};
    
vows.describe('drone/spawn/parent').addBatch({
  "When using haibu-drone": {
    "an initial spawn of the child": helper.assertParentSpawn(options)
  }
}).addBatch({
  "followed by a second spawn of the same child": helper.assertParentSpawn(options)
}).export(module);
