var path = require('path'),
  fs = require('fs');

module.exports = function coffeePlugin(carapace) {
  if (!carapace.coffee) {
    carapace.coffee = function (value, done) {
      var coffeeBin = fs.realpathSync(path.join(process.execPath, '..', 'coffee'));
      //
      // This will be immediately called when this plugin is passed to `.use()`
      //
      // Should change `process.argv[1]` to coffee and then rewrite the CLI arguments
      // as necessary so that the .coffee is handled correctly by the `coffee` binary.
      //
      var script = carapace.script;
      function replaceWithCoffee() {
        carapace.script = coffeeBin;
        carapace.argv.unshift(script);
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
