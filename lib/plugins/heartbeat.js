//
// Fires off functions at end of a heartbeat event
//
var enabled = false;

module.exports = function (carapace) {
  if (!enabled) {
    enabled = true;
    setInterval(function () {
      carapace.emit('carapace::heartbeat');
    }, 1000);
  }  
};
