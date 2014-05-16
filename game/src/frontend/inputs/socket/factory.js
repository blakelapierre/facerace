var angular = require('angular'),
  io = require('socket.io');

module.exports = [function SocketFactory () {
  return io.connect('http://' + window.location.host);
}];