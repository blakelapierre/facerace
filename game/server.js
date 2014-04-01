var startServer = function(config, callback) {
	var path = require('path'),
		express = require('express'),
		socketIO = require('socket.io'),
		webRTC = require('webrtc.io'),
		socketIOdb = require('./public/js/db/socketIOdb'),
		app = express();

	app.use(express.static(path.join(__dirname, '/public')));


	var webserver = app.listen(config.port),
		rtc = webRTC.listen(config.rtcport),
		io = socketIO.listen(webserver),
		db = socketIOdb.host(io);

	var facerace = require('./public/js/facerace/facerace')
		facerace = facerace(io);
	
	for(var i = 0; i < 5; i++) {facerace()};
	

	return callback(webserver, io, rtc);
};

exports.startServer = startServer;
exports.startServer({
	port: 2888,
	rtcport: 2887
}, function(webserver, io, rtc) {});