var server = require('http').createServer(function (req,res) {
  res.end('CWD: ' + process.cwd());
});
server.listen(1337);
console.dir('server running on 1337')
