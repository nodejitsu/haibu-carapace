module.exports = function (carapace) {
  carapace.on('heartbeat',function (done) {
    if(done) done();
  });
}
