//
// cloud-drive plugin for mounting cloud storage engines to applications as virtual paths
//
var enabled = false;

var drive = require('cloud-drive');

module.exports = function (carapace) {
  
  carapace['cloud-drive'] = function clouddrive (provider, options, callback) {

    //
    // Create a new cloud-drive based on `node-cloud-drive` API and `pkgcloud` provider API
    //
    drive[provider.provider].createClient(provider);

    //
    // Mount a new virtual path "/mydrive" to our cloud path "./public"
    //
    drive.mount(options.path, options.cloudPath);

    return callback ? callback() : null;
  };
};
