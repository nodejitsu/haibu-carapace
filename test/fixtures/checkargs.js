/*
 * checkargs.js: Test fixture for a custom plugin in haibu-drone which uses custom arguments.
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */
 
module.exports = function checkargsPlugin (drone) {
  if (!drone.checkargs) {
    drone.checkargs = function () {
      setInterval(function () {
        drone.emit('drone::checkargs', { id: drone.id, checkargs: process.argv['checkargs'] });
      }, 1000);
    };
    
    drone.checkargs();
  }
};