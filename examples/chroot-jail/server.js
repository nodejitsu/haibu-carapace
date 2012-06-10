var port, server, path = require('path');

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

var fs = require('fs');

// At this point, __dirname should equal "/"
var p = __dirname + '../helloworld.js';
p = path.resolve(p);
// should output: /helloworld.js
console.log(p);

//
// Attempt to read file outside of jail
//
fs.readFile(p, function (err, contents) {
  if (err) {
    console.log('Cannot load a file out-side the chroot!');
    return console.log(err);
  }
  console.log('should not see this buffer...', contents);
});

//
// Attempt to write file outside of jail
//
fs.writeFile(p, 'test output', function (err) {
  if (err) {
    console.log('Cannot write a file out-side the chroot!');
    return console.log(err);
  }
});
