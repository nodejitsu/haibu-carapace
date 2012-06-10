#!/usr/bin/env node

var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write(JSON.stringify(process.env))
  res.end();
}).listen(8080);


console.log('> http server has started on port 8080');
