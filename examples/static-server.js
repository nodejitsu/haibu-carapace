//
// static-server.js
// 
// A proof-of-concept static server that serves files using fs.createReadStream
//

var http = require('http'),
    fs   = require('fs');

//
// Remark: '/mydrive' will not exist unless you are using the `cloud-drive` plugin
//
http.createServer(function (req, res) {
  if(req.url === "/") {
    req.url = "/index.html";
  }
 fs.createReadStream('/mydrive' + req.url).pipe(res)
}).listen(8080);

console.log('> http server has started on port 8080');