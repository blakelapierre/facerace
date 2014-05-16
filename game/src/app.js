var http = require('request'),
    fs = require('fs'),
    path = require('path'),
    faceraceServer = require('./server/server');

var startServer = function(config, callback) {
  getPublicAddress(function(address) {
    console.log('Got address...', address);

    fs.writeFileSync('public_address', address);

    config.publicAddress = address;
    faceraceServer(config, callback);
  });
};

var getPublicAddress = function(deliver) {
  console.log('determining public ip address...');

  if (fs.existsSync('public_address')) {
    deliver(fs.readFileSync('public_address').toString());
    return;
  }

  http.get('http://fugal.net/ip.cgi', function(error, res, body) {
    console.log(arguments);
      if(res.statusCode != 200) {
          throw new Error('non-OK status: ' + res.statusCode);
      }
      deliver(body.trim());
  }).on('error', function(err) {
      throw err;
  });
};

exports.startServer = startServer;
exports.startServer({
  port: 2888,
  rtcport: 2887,
  serverRoot: __dirname,
  repoLocation: path.join(__dirname, './../../'),
  distRoot: path.join(__dirname, './../dist')
}, function(webserver, io, rtc) { });