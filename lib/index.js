var fs = require('fs');
var path = require('path');
carapace = module.exports;
//
// Plugins list
//
carapace.plugins = {};

var plugins = fs.readdirSync(path.join(__dirname,'../lib/plugins'));
plugins.forEach(function(name){
  carapace.plugins[name.replace(/\.js$/,'')] = path.join(__dirname,'../lib/plugins',name);
});
