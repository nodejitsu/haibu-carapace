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
    argv = ['--plugin', 'chroot', '--plugin', 'chdir', '--chroot', jail, '--chdir', '/', '--hook-name', 'carapace'],
    PORT = 5060;
    
vows.describe('carapace/run').addBatch({
  "When using haibu-carapace": helper.assertParentSpawn(PORT, script, argv, '/')
}).export(module);
