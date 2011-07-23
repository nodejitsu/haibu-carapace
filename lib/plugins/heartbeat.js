//
// Fires off functions at end of a heartbeat event
//
var enabled = false;

module.exports = function (carapace) {
  carapace.heartbeat = function heartbeat(onBlip) {
    enabled = !enabled;
    if(!enabled) {
      clearInterval(this.interval);
    }
    else {
      this.interval = setInterval(function () {
        carapace.emit('carapace::heartbeat');
        onBlip();
      }, 1000);
    }
  }
};
