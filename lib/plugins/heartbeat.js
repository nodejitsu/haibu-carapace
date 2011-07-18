//
// Fires off functions at end of a heartbeat event
//
module.exports = function (carapace) {
  setInterval(function(){
    carapace.emit('heartbeat');
  },1000);
}
