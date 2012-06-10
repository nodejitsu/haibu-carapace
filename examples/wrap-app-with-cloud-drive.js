//
// wrap-app-with-cloud-drive.js
// 
// Example of spawning an application and mounting a virtual cloud path to it's `fs` module using `node-cloud-drive`
//

var carapace = require('../lib/carapace');

carapace.on('carapace::plugin::error', function (info) {
  console.log('Error loading plugin: ' + info.plugin);
  console.log(info.error.message);
  console.dir(info.error.stack.split('\n'))
});

carapace.use([
  carapace.plugins['cloud-drive']
], function () {

  //
  // Start a simple http static file server that uses `fs.createReadStream`
  //
  carapace.script = "static-server.js";
  
  carapace.run(function afterRun(err) {
    
    if (err) {
      return console.log(err.message.red);
    }

    //
    // `provider` will get passed to the `pkgcloud` provider API
    //
    var provider = {
      provider: 'dropbox',
      oauth_token_secret: '1234',
      oauth_token: '5678',
      uid: '90210'
    };

    //
    // For this example, we've mapped a virtual path `/mydrive` in the spawned app to a dropbox's `/public` folder.
    // Now, inside the app we can use the `fs` module to access the `/mydrive` path as if it was a local file-system
    //
    var options = {
      path: '/mydrive',
      cloudPath: '/public'
    };

    carapace['cloud-drive'](provider, options, function () {
      console.log('mounted ' + options.path + ' to ' + provider.provider + ' ' + options.cloudPath);
    });

  });
}); 
