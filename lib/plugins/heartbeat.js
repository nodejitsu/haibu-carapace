//
// Fires off functions at end of a heartbeat event
//
var enabled = false;

module.exports = function (carapace) {
  carapace.heartbeat = function heartbeat(onBlip, interval) {
    enabled = !enabled;
    if(!enabled) {
      clearInterval(this.interval);
    }
    else {
      // 
      // make sure we have/set the interval
      //
      if(!interval) {
        interval = carapace.cli.defaultOptions['heartbeat'].default;
      }
      else {
        carapace.cli.defaultOptions['heartbeat'].default = interval;
      }
      //
      // start the timer
      //
      this.interval = setInterval(function () {
        carapace.emit('carapace::heartbeat');
        return done ? done() : null;
      }, interval);
    }
  }
};
