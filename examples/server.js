require('http').createServer(function(req,res) {
  res.end('CWD: ' + process.cwd());
}).listen(1337);
console.dir('server running on 1337')
