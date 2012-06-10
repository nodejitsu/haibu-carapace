var path = require('path'),
  fs = require('fs');

module.exports = function coffeePlugin(drone) {
  if (!drone.coffee) {
    drone.coffee = function (value, done) {
      var coffeeBin = fs.realpathSync(path.join(process.execPath, '..', 'coffee'));
      //
      // This will be immediately called when this plugin is passed to `.use()`
      //
      // Should change `process.argv[1]` to coffee and then rewrite the CLI arguments
      // as necessary so that the .coffee is handled correctly by the `coffee` binary.
      //
      var script = drone.script;
      function replaceWithCoffee() {
        drone.script = coffeeBin;
        drone.argv.unshift(script);
      }
      if (value == 'true' || /\.coffee$/.test(script)) {
        replaceWithCoffee();
        done();
      }
      else {
        //
        // Check shebang ... ugg, needed for executables
        //
        var file = fs.createReadStream(script);
        var line = '';
        var shebangLine = /^#!.*coffee$/;
        file.on('error', function () {
          done();
        })
        file.on('data', function (data) {
          data = data + '';
          var lines = data.split(/\r?\n/);
          if (lines.length > 1) {
            file.destroy();
            line += lines[0];
            if (shebangLine.test(line)) {
              replaceWithCoffee();
            }                          
            done();
            return;
          }
          line += lines[0];
        });
        file.on('end', function () {
          done();
        });
      }
    };
  }
};
