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
    script =  path.join(jail, 'server.js'),
    argv = ['--hook-name', 'carapace'],
    PORT = 5060;
    
vows.describe('carapace/spawn/parent').addBatch({
  "When using haibu-carapace": helper.assertListen(PORT, {
    "an initial spawn of the child": helper.assertParentSpawn(PORT, script, argv, process.cwd())
  })
}).addBatch({
  "followed by a second spawn of the same child": helper.assertParentSpawn(PORT, script, argv, process.cwd())
}).export(module);
