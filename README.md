# haibu-carapace

Haibu Drone's Little Shell

## What is Carapace

Carapace is an process wrapper for Node.js applications that is part of the [Haibu][1] Network.
Carapace also provides a plugin system to simplify deployment and development of applications.

## What can I do with Carapace?

By utilizing Carapace you can help automate deployments of applications into a custom environment.
Combining Carapace with the [Forever][3] Daemon can allow you run the application in the environment indefinitely.

## Carapace CLI Options

`carapace --plugin [plugin] --[plugin] [options] application [options]`

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

* chdir - directory to change into 
* heartbeat - time in micro-seconds between 'carapace::heartbeat' events
* coffee - spawn `.coffee` files
* setuid - set the uid of the spawned process
* net - automatically listen on a new port if `EADDRINUSE` is thrown

## Installation

``` bash
  $ [sudo] npm install carapace
```

## Run Tests
All of the `carapace` tests are written in [vows][4]

``` bash
  $ npm test
```

#### Author: [Nodejitsu Inc.](http://www.nodejitsu.com)
#### Maintainers: [Charlie Robbins](https://github.com/indexzero), [Bradley Meck](https://github.com/bmeck), [Jameson Lee](https://github.com/drjackal)

[1]:https://github.com/nodejitsu/haibu
[3]:https://github.com/indexzero/forever
[4]:https://github.com/cloudhead/vows