var startServer = function(config, callback) {
	var path = require('path'),
		express = require('express'),
		socketIO = require('socket.io'),
		webRTC = require('webrtc.io'),
		socketIOdb = require('./public/js/db/socketIOdb'),
		fs = require('fs'),
		_ = require('lodash'),
		app = express();

	app.use(express.static(path.join(__dirname, '/public')));


	var webserver = app.listen(config.port),
		rtc = webRTC.listen(config.rtcport),
		io = socketIO.listen(webserver),
		db = socketIOdb.host(io);

	io.set('log level', 0);

	var transport = {},
		facerace = require('./public/js/facerace/facerace'),
		facerace = facerace(true, rtc, io);

	fs.readdir('./public/images', function(err, files) {
		if (err) throw err;

		var maps = [];
		_.each(files, function(file) {
			var stat = fs.statSync(path.join(__dirname, 'public/images', file));
			if (stat.isDirectory()) maps.push(file);
		});
		facerace.loadMaps(maps);

	});

	var transport = {},
		log = [];
	setInterval(function () {
		transport = facerace(transport);
		if (log.length == 0) log.push(transport.state);
		if (transport.events.processedEvents.length > 0) log.push(transport.events.processedEvents);
	}, 100);
	

	app.get('/channels', function(req, res) {
		res.json(rtc.rtc.rooms);
	});

	app.get('/log', function(req, res) {
		res.json(log);
	});

	// var core = {
	// 	update: function() {console.log('update')},
	// 	test: 'test'
	// };

	// with (core) {
	// 	(function() {
	// 		update();
	// 		console.log(test);
	// 		var test = 'no';
	// 		console.log(test);
	// 	})();
	// }	

	return callback(webserver, io, rtc);
};

exports.startServer = startServer;
exports.startServer({
	port: 2888,
	rtcport: 2887
}, function(webserver, io, rtc) { });