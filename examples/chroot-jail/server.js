var port, server;

port   = exports.port   = 1337;
server = exports.server = require('http').createServer(function (req,res) {
  console.dir('server.js got a request');
  res.end(process.cwd());
});


// Ultra-Naive port binding
if (process.argv.length === 4) {
  port = process.argv[3];
}

// listen
server.listen(port);
