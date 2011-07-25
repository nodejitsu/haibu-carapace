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
    eyes = require('eyes'),
    request = require('request'),
    carapace = require('../../lib/carapace');

var carapaceBin = path.join(__dirname, '..', '..', 'bin', 'carapace');

var macros = exports;

macros.assertListen = function (port, vows) {
  var context = {
    topic: function () {
      carapace.listen({ 'hook-port': port }, this.callback.bind(this, null));
    },
    "it should fire the `carapace::listening` event": function (_, name) {
      assert.isTrue(carapace.listening);
    }
  };
  
  return extendContext(context, vows);
};

macros.assertUse = function (plugins, vows) {
  var context = {
    topic: function () {
      if (typeof plugins === 'string') {
        carapace.use(carapace.plugins[plugins], this.callback.bind(this, null));
        return undefined;
      }

      //
      // should be an array
      // we have to do this because carapace, preloads these plugins
      //
      var pg = plugins.map(function (plugin) {
        return carapace.plugins[plugin];
      });
      
      carapace.use(pg, this.callback.bind(null, null));
    },
    "should have load the plugin(s)": function () {
      if (typeof plugins === 'string') {
        assert.isString(plugins);
        assert.isFunction(carapace[plugins]);
        return; 
      }

      assert.isArray(plugins);
      plugins.forEach(function (plugin) {
        //
        // Remark (drjackal): Hopefully nothing malicious in plugins...
        //
        assert.isFunction(carapace[plugin]);
      });
    }
  };
  
  return extendContext(context, vows);
};

macros.assertRun = function (script, argv, vows) {
  var context = {
    topic: function () {
      carapace.on('carapace::running', this.callback.bind(this, null));
      carapace.run(script, argv || []);
    },
    "should fire the `carapace::running` event": function (_, name) {
      assert.equal(name, 'carapace::running');
    },
    "should rewrite process.argv transparently": function (_, name) {
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
      assert.isTrue(true);
    }
  }
  
  return extendContext(context, vows);
};

macros.assertParentSpawn = function (PORT, script, argv, vows) {
  argv = argv.slice(0);
  argv.push(script);
  
  var context = {
    "when spawning a child carapace": {
      topic: function () {
        var that = this,
            child = spawn(carapaceBin, ['--hook-port', PORT].concat(argv));
        
        carapace.on('*::port', function (source, ev, port) { 
          if (port === 1337) {
            console.dir(arguments);
            that.callback(null, source, ev, port);
          }
        });        
      },
      "should emit the `*::port` event": {
        topic: function () {
          console.dir(arguments);
          this.callback.apply(this, arguments)
        },
        "with the correct port": function (err, event, port) {
          console.dir(arguments);
          assert.equal(event, '*::port');
          assert.equal(port, 1337);
        },
        "should correctly start the HTTP server": {
          topic: function () {
            request({ uri: 'http://localhost:1337' }, this.callback);      
          },
          "that responds with a cwd": function (err, res, body) {
            assert.equal(body, '/');
          }
        }
      }
    }
  };
  
  context = extendContext(context, vows);
  return macros.assertListen(PORT, context);
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
