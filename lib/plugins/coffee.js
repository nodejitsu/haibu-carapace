var path = require('path');

module.exports = function coffeePlugin(carapace) {
  if (!carapace.coffee) {
    carapace.coffee = function (value, done) {
      //
      // This will be immediately called when this plugin is passed to `.use()`
      //
      // Should change `process.argv[1]` to coffee and then rewrite the CLI arguments
      // as necessary so that the .coffee is handled correctly by the `coffee` binary.
      //
    };
  }
};
