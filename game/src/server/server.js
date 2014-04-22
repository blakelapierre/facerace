var path = require('path'),
	fs = require('fs'),
	express = require('express'),
	socketIO = require('socket.io'),
	webRTC = require('webrtc.io'),
	roomNotifier = require('./roomNotifier'),
	_ = require('lodash'),
	app = express();

module.exports = function(config, callback) {
	var serverRoot = config.serverRoot;

	app.use(express.static(path.join(serverRoot, '..', 'dist')));
	app.use('/images', express.static(path.join(serverRoot, 'images')));


	var webserver = app.listen(config.port),
		manager = webRTC.listen(config.rtcport),
		io = socketIO.listen(webserver);

	io.set('log level', 0);

	var transport = {},
		facerace = require('../sim/facerace'),
		facerace = facerace(true, manager, io);

	var imagesRoot = path.join(serverRoot, 'images');
	fs.readdir(imagesRoot, function(err, files) {
		if (err) throw err;

		var maps = [];
		_.each(files, function(file) {
			var stat = fs.statSync(path.join(imagesRoot, file));
			if (stat.isDirectory()) maps.push(file);
		});
		facerace.loadMaps(maps);

	});

	(function() {
		var transport = {},
			log = [];
		setInterval(function () {
			transport = facerace(transport);
			if (log.length == 0) log.push(transport.state);
			if (transport.events.processedEvents.length > 0) log.push(transport.events.processedEvents);
		}, 100);
	})();

	var router = express.Router();

	roomNotifier(router, manager, config);

	router.get('/channels', function(req, res) {
		res.json(manager.rtc.rooms);
	});

	router.get('/log', function(req, res) {
		res.json(log);
	});

	app.use('/', router);

	return callback(webserver, io, manager);
};