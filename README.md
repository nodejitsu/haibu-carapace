# Haibu-Carapace

Haibu Drone's Little Shell
## What is Carapace

Carapace is an process wrapper for Node.js applications that is part of the [Haibu][1] Network.
Carapace also provides a plugin system to simplify deployment and development of applications.
## What can I do with Carapace?

By utilizing Carapace you can help automate deployments of applications into a custom environment.
Combining Carapace with the [Forever][3] Daemon can allow you run the application in the environment indefinitely.
## Installation

### Installing npm (node package manager)
```shell
curl http://npmjs.org/install.sh | sh
```

### Installing drone
```shell
[sudo] npm install drone
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

var drone = require('haibu-drone');

var script = 'server.js',
    scriptPort = 31337;

drone.on('drone::plugin::error', function (info) {
  console.log('Error loading plugin: ' + info.plugin);
  console.log(info.error.message);
  console.dir(info.error.stack.split('\n'))
});

drone.use([
  drone.plugins.heartbeat, 
  drone.plugins.chroot, 
  drone.plugins.chdir
], function () {
  drone.chroot('./examples/chroot-jail', console.log.bind(null, 'hello'));
  drone.chdir('.');
  drone.run(script, ['--port', scriptPort], function afterRun() {
    drone.heartbeat(function () {
      console.log('bump'.red);
    },1000);
    console.log(script+ ' running on port '+ scriptPort.toString());
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

`drone --plugin [plugin] --[plugin] [options] application [options]`

#### *Plugins*
`--plugin [plugin]`

Plugin to use with the drone instance

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
* heartbeat - time in micro-seconds between 'drone::heartbeat' events

## Run Tests
All of the `drone` tests are written in [vows][4]

``` bash
  $ npm test
```

#### Author: [Nodejitsu Inc.](http://www.nodejitsu.com)
#### Maintainers: [Charlie Robbins](https://github.com/indexzero),  [Bradley Meck](https://github.com/bmeck),  [Jameson Lee](https://github.com/drjackal)

[1]:https://github.com/nodejitsu/haibu
[3]:https://github.com/indexzero/forever
[4]:https://github.com/cloudhead/vows