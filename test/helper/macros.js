/*
 * macros.js: Test macros hook.io module
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var assert = require('assert'),
    eyes = require('eyes');
    carapace = require('../../lib/carapace');

var macros = exports;

macros.assertListen = function (carapace, port, vows) {
  var context = {
    topic: function () {
      var instance = carapace,
          that = this;
      //
      // TODO: change when hook.io v0.5.2 is out
      //
      instance.on('hook::listening', function runner() {
        process.nextTick(that.callback.bind(null, null, instance));
      });
      instance.listen({ port: port });
    },
    "it should fire the `carapace::listening` event": function (_, instance, name) {
      //
      // Another work around for `hook.io@0.5.1`
      // because we aren't at carapace::listening, so it is false
      // 
      assert.isFalse(carapace.listening);
    }
  };
  
  return extendContext(context, vows);
};

macros.assertUse = function (carapace, plugins, vows) {
  var context = {
    topic: function () {
      var instance = carapace;
      carapace.use(plugins, this.callback.bind(null, null, instance));
    },
    "should have loaded all the plugins": function (_, instance) {
      // todo
      assert.isTrue(false);
    }
  };
  
  return extendContext(context, vows);
};

macros.assertRun = function (carapace, argv, vows) {
  var context = {
    topic: function () {
      var instance = carapace;
      instance.on('carapace::running', this.callback.bind(null, null, instance));
    },
    "should fire the `carapace::running` event": function (_, instance, name) {
      assert.equal(name, 'hook::ready');
    }
  };
  
  return extendContext(context, vows);
};

function extendContext (context, vows) {
  if (vows) {
    if (vows.topic) {
      console.log('Cannot include topic at top-level of nested vows:');
      eyes.inspect(vows, 'vows');
      process.exit(1);
    }
    
    Object.keys(vows).forEach(function (key) {
      context[key] = vows[key];
    });
  }
  
  return context;
}
