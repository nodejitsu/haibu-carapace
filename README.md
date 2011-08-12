# Haibu-Carapace

Haibu Drone's Little Shell
## What is Carapace

Carapace is an process wrapper for Node.js applications that is part of the [Haibu][1] Network.
Carapace also provides a [Hook.IO][2] based plugin system to simplify deployment and development of applications.
## What can I do with Carapace?

By utilizing Carapace you can help automate deployments of applications into a custom environment.
Combining Carapace with the [Forever][3] Daemon can allow you run the application in the environment indefinitely.
## Installation

### Installing npm (node package manager)
```shell
curl http://npmjs.org/install.sh | sh
```

### Installing carapace
```shell
[sudo] npm install carapace
```

## Example(s)
### Chroot Jailed web-server (using the script)
```shell
# run the included shell script in a terminal
sudo ./examples/jailedserver
# then on another terminal poke the server using `curl` and `watch`
watch 'curl http://localhost:1337'
```

### Chroot Jailed Web-server (as a require)
code is available in `./examples/jailer.js` and must be ran with **superuser privileges**

```javascript

var carapace = require('../lib/carapace');

var script = 'server.js',
    hookOpts = {
      'debug' : false,
      'hook-port' :  5061
    },
    scriptPort = 31337;

carapace.listen( hookOpts,function () {
  carapace.on('carapace::plugin::error', function (info) {
    console.log('Error loading plugin: ' + info.plugin);
    console.log(info.error.message);
    console.dir(info.error.stack.split('\n'))
  });

  carapace.use([
    carapace.plugins.heartbeat, 
    carapace.plugins.chroot, 
    carapace.plugins.chdir
  ], function () {
    carapace.chroot('./examples/chroot-jail', console.log.bind(null, 'hello'));
    carapace.chdir('.');
    carapace.run(script, ['--port', scriptPort], function afterRun() {
      carapace.heartbeat(function () {
        console.log('bump'.red);
      },1000);
      console.log(script.yellow + ' running on port '.grey + scriptPort.toString().green);
    });
  });  
});

```
```shell
# Run the above code in a terminal with
sudo node ./examples/jailer.js
# Poke the server in another terminal with
watch 'curl http://localhost:31337'
```

## Carapace CLI Options

`carapace [hook-options] --plugin [plugin] --[plugin] [options] application [options]`

#### *Carapace's Plugin Manager Options*
`--hook-port [port]`
`--hook-host [hostname]`

Carapace's Plugin Manager's Listening port/hostname

#### *Plugins*
`--plugin [plugin]`

Plugin to use with the carapace instance

#### *Plugin Options*
`--[plugin] [options]`

Option to be passed to the [plugin]

#### *Application & Application's Options*
`[application] [application's CLI options]`

Any options that isn't consumed by the Carapace will automatically be passed to the application

## Default Plugins
List of known plugins, and options (if any) used by them

* chroot - directory to rebind as root directory '/'
* chdir - directory to change into 
* heartbeat - time in micro-seconds between 'carapace::heartbeat' events

## Run Tests
All of the `carapace` tests are written in [vows][4]

``` bash
  $ npm test
```

#### Author: [Nodejitsu Inc.](http://www.nodejitsu.com)
#### Maintainers: [Charlie Robbins](https://github.com/indexzero),  [Bradley Meck](https://github.com/bmeck),  [Jameson Lee](https://github.com/drjackal)

[1]:https://github.com/nodejitsu/haibu
[2]:https://github.com/hookio/hook.io
[3]:https://github.com/indexzero/forever
[4]:https://github.com/cloudhead/vows