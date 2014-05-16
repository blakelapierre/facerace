var angular = require('angular'),
    o = require('socket.io');

module.exports = [function SocketFactory () {
  return io.connect('http://' + window.location.host);
}];