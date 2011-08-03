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
  var names = typeof plugins === 'string'
    ? path.basename(plugins, '.js')
    : plugins.map(function (p) { return path.basename(p, '.js') });
  
  var context = {
    topic: function () {
      if (typeof plugins === 'string') {
        console.dir(plugins);
        carapace.load(plugins);
        carapace.use(carapace.plugins[names], this.callback.bind(this, null));
        return undefined;
      }

      //
      // should be an array
      // we have to do this because carapace, preloads these plugins
      //
      var pg = plugins.map(function (plugin) {
        return carapace.load(plugin);
      });
      
      carapace.use(pg, this.callback.bind(null, null));
    },
    "should have load the plugin(s)": function () {
      if (typeof plugins === 'string') {
        assert.isString(names);
        assert.isFunction(carapace[names]);
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
      carapace.on('carapace::running', this.callback.bind(carapace, null));
      carapace.run(script, argv || []);
    },
    "should fire the `carapace::running` event": function () {
      assert.equal(carapace.event, 'carapace::running');
    },
    "should rewrite process.argv transparently": function () {
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
      var that = this,
          child = spawn(carapaceBin, ['--hook-port', PORT, script].concat(argv));      
      
      child.stdout.once('data', that.callback.bind(null, null, child));
    },
    "should respond with the proper wrapped script output": function (_, child, data) {
      assert.notEqual(data.toString().indexOf(script), -1);
    }
  }
  
  return extendContext(context, vows);
};

macros.assertParentSpawn = function (PORT, script, argv, cwd, vows) {
  argv = argv.slice(0);
  argv.push(script);
  
  var context = {
    "when spawning a child carapace": {
      topic: function () {
        var that = this,
            child = spawn(carapaceBin, ['--hook-port', PORT].concat(argv));
        
        carapace.on('*::carapace::port', function onPort (info) {
          if (info.port && info.port !== carapace['hook-port']) {
            that.port = info.port;
            info.event = this.event
            that.callback(null, info, child);
            carapace.un('*::carapace::port', onPort);
          }
        });
      },
      "should emit the `*::carapace::port` event": {
        topic: function (info, child) {
          this.callback(null, info, child);
        },
        "with the correct port": function (_, info, child) {
          assert.isTrue(!!~info.event.indexOf('carapace::port'));
          assert.equal(info.port, this.port);
          assert.notEqual(info.port, carapace['hook-port'])
        },
        "should correctly start the HTTP server": {
          topic: function (_,_,_,child) {
            request({ uri: 'http://localhost:' + this.port }, this.callback.bind(null, null, child));
          },
          "that responds with a cwd": function (_, child, err, res, body) {
            child.kill();
            assert.equal(body, cwd);
          },
        }
      }
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
