# Carapace

## What is carapace

Carapace is an in process wrapper for Node.js applications.
It provides a bridge for setting up applications and extended communications.
It also provides a plugin system to ease development of applications that need to be private.

## Example workflow

On terminal one: open up a carapace.

```
carapace ./test
```

On terminal two: chroot the process.
Then tell carapace to run a script *server.js* from where we were chrooted.

```
//
// Connect to the carapace
//
var carapace = require('carapace');
require('dnode').connect(__dirname + '/test', function(client, conn) {
  //
  // Tell the carapace we have a new plugin to be loaded
  //
  client.emit('plugin',carapace.plugins.chroot, function() {
    //
    // Tell carapace we have a new directory to use as root
    //
    client.emit('chroot:root','..', function() {
      //
      // Tell carapace to run a script
      //
      client.emit('run', 'server.js');
    });
  })
});

```
