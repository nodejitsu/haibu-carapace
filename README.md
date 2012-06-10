# drone

*drone image goes here*

Wrap any node.js applications into a smart `drone` object.  A `drone` can be considered a spawned node.js process wrapped in additional functionality, such as: `chdir`, `chroot`. 

## Features

  - Requires zero-modification to target spawn application
  - Battle-hardened from production usage at Nodejitsu
  - Ships with plugin system for attaching drone functionality
  - Full integration  with the <a href="http://github.com/nodejitsu/haibu">haibu</a> application server

## Installation

```shell
[sudo] npm install drone -g
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

[1]:https://github.com/nodejitsu/haibu
[3]:https://github.com/indexzero/forever
[4]:https://github.com/cloudhead/vows