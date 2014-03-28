var startServer = function(config, callback) {
	var express = require('express'),
		socketIO = require('socket.io'),
		webRTC = require('webrtc.io'),
		path = require('path'),
		app = express();

	app.use(express.static(path.join(__dirname, '/public')));	

	var webserver = app.listen(config.port),
		rtc = webRTC.listen(config.rtcport),
		io = socketIO.listen(webserver);

	return callback(webserver, io, rtc);
};

exports.startServer = startServer;
exports.startServer({
	port: 3000,
	rtcport: 3001
}, function(webserver, io, rtc) {});