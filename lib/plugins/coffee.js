var path = require('path'),
  coffeeBin = path.join(process.execPath, '..', 'coffee');

module.exports = function coffeePlugin(carapace) {
  if (!carapace.coffee) {
    carapace.coffee = function (value, done) {
      //
      // This will be immediately called when this plugin is passed to `.use()`
      //
      // Should change `process.argv[1]` to coffee and then rewrite the CLI arguments
      // as necessary so that the .coffee is handled correctly by the `coffee` binary.
      //
      var script = carapace.script;
      if (value == 'true' || script.match(/\.coffee$/)) {
        carapace.script = coffeeBin;
        carapace.argv.unshift(script);
      }
      done();
    };
  }
};
