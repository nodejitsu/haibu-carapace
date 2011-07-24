/*
 * macros.js: Test macros hook.io module
 *
 * (C) 2011 Marak Squires, Charlie Robbins
 * MIT LICENCE
 *
 */

var assert = require('assert'),
    path = require('path'),
    spawn = require('child_process').spawn,
    eyes = require('eyes');

var carapaceBin = path.join(__dirname, '..', '..', 'bin', 'carapace');

var macros = exports;

macros.assertListen = function (carapace, port, vows) {
  var context = {
    topic: function () {
      var instance = carapace;
      
      instance.listen({ port: port }, this.callback.bind(this, null, instance));
    },
    "it should fire the `carapace::listening` event": function (_, instance, name) {
      assert.isTrue(instance.listening);
    }
  };
  
  return extendContext(context, vows);
};

macros.assertUse = function (carapace, plugins, vows) {
  var context = {
    topic: function () {
      var instance = carapace;
      if (typeof plugins === 'string') {
        instance.use(instance.plugins[plugins], this.callback.bind(null, null, instance));
        return undefined;
      }

      //
      // should be an array
      // we have to do this because carapace, preloads these plugins
      //
      var pg = plugins.map(function (plugin) {
        return instance.plugins[plugin];
      });
      
      instance.use(pg, this.callback.bind(null,null,instance));
    },
    "should have load the plugin(s)": function (_, instance) {
      if (typeof plugins === 'string') {
        assert.isString(plugins);
        assert.isFunction(instance[plugins]);
        return; 
      }

      assert.isArray(plugins);
      plugins.forEach(function (plugin) {
        //
        // Remark (drjackal): Hopefully nothing malicious in plugins...
        //
        assert.isFunction(instance[plugin]);
      });
    }
  };
  
  return extendContext(context, vows);
};

macros.assertRun = function (carapace, script, argv, vows) {
  var context = {
    topic: function () {
      var instance = carapace;
      instance.on('carapace::running', this.callback.bind(null, null, instance));
      instance.run(script, argv || []);
    },
    "should fire the `carapace::running` event": function (_, instance, name) {
      assert.equal(name, 'carapace::running');
    },
    "should rewrite process.argv transparently": function (_, instance, name) {
      assert.equal(process.argv[1], script);
    }
  };
  
  return extendContext(context, vows);
};

macros.assertSpawn = function (PORT, script, argv, vows) {
  argv = argv.slice(0);
  argv.push(script);
  
  var context = {
    topic: function () {
      var child = spawn(carapaceBin, ['--hook-port', PORT].concat(argv));
      child.stdout.once('data', this.callback.bind(this, null, child));
    },
    "should respond with the proper wrapped script output": function (_, child, data) {
      assert.isTrue(!!data.toString().indexOf('server.js'))
    }
  }
  
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
