
var port   = exports.port   = 1337;
var server = exports.server = require('http').createServer(function (req,res) {
  console.dir('INCOMING REQUEST! DUCK!');
  res.end('CWD: ' + process.cwd());
});

server.listen(port);
