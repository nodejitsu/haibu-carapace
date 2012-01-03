var port, server;

// default port to listen to
port = 1337;

// Unless a specific port is request via argv
if (process.argv.length === 4) {
  // if we get a --port and the value passed is a number
  if (process.argv[2] === '--port' && Number(process.argv[3])) {
    // should set the passed value as the port
    port = Number(process.argv[3]);
  }
}

// start the http server
server = require('http').createServer(function (req, res) {
  res.end(process.cwd());
});

// export before we leave
exports.port = port;
exports.server = server;

// and start the server
server.listen(port);
