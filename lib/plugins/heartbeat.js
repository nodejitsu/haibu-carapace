//
// Fires off functions at end of a heartbeat event
//

var enabled = false;

module.exports = function (carapace) {
  carapace.heartbeat = function heartbeat() {
    var args = Array.prototype.slice.call(arguments),
        interval = 1000,
        done;

    args.forEach(function (a) {
      switch (typeof a) {
        case 'number': interval = a; break;
        case 'function': done = a; break;
        default: break;
      }
    });

    enabled = !enabled;

    if (!enabled) {
      return clearInterval(this.interval);
    }

    //
    // make sure we have/set the interval
    //
    if (!interval) {
      interval = carapace.cli.defaultOptions['heartbeat'].default;
    }
    else {
      carapace.cli.defaultOptions['heartbeat'].default = interval;
    }

    //
    // start the timer
    //
    this.interval = setInterval(function () {
      carapace.emit('heartbeat', carapace.id);
    }, interval);
    
    return done ? done() : null;
  };
};
