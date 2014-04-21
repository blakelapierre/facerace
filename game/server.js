var http = require('request'),
	fs = require('fs');

var startServer = function(config, callback) {
	getPublicAddress(function(address) {
		console.log('Got address...', address);

		fs.writeFileSync('public_address', address);

		config.publicAddress = address;
		startServices(config, callback);
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

var startServices = function(config, callback) {
	var path = require('path'),
		express = require('express'),
		socketIO = require('socket.io'),
		webRTC = require('webrtc.io'),
		nodemailer = require('nodemailer'),
		socketIOdb = require('./public/js/db/socketIOdb'),
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

	(function(router, manager) {
		// var mailer = nodemailer.createTransport('SMTP', {
		// 	service: 'Gmail',
		// 	auth: {
		// 		user: 'hello.world.video.chat@gmail.com',
		// 		pass: 'palebluedot'
		// 	}
		// });

		var mailer = nodemailer.createTransport('SMTP', {
			host: 'mail.facerace.in',
			port: 587,
			auth: {
				user: 'you.are.invited@facerace.in',
				pass: 'palebluedot'
			}
		});

		var roomSubscriptions = {
			
		};

		var host = config.publicAddress;

		if (host == '107.170.237.209') host = 'facerace.in';

		var notifyRoomSubscriptions = function(room) {
			var subscriptions = roomSubscriptions[room] || [];

			for (var i = 0; i < subscriptions.length; i++) {
				mailer.sendMail({
					from: 'you.are.invited@facerace.in',
					to: subscriptions[i],
					subject: 'Someone just joined ' + room,
					text: 'Join them: http://' + host + ':' + config.port + '/' + room
				}, function(error, responseStatus) {
					console.log(arguments);
				});
			}
		};

		var invite = (function() {
			var email = function(address, room) {
				mailer.sendMail({
					from: 'you.are.invited@facerace.in',
					to: address,
					subject: 'Someone just invited you to video chat',
					text: 'Join them: http://' + host + ':' + config.port + '/' + room
				}, function(error, responseStatus) {
					console.log(arguments);
				});
			};

			var text = function(number, room) {
				console.log('posting', number, room);
				http.post('http://localhost:9090/text', {form: {number: number, message: 'Someone invited you to video chat. Join them: http://' + host + ':' + config.port + '/' + room}})
			};

			return function(address, room) {
				console.log('sending to', address, room);
				if (/.*\@\.*/.test(address)) email(address, room);
				else text(address, room);
			};
		})();

		manager.rtc.on('join_room', function(data, socket) {
			notifyRoomSubscriptions(data.room);
		});

		router.post('/invite/:address', function(req, res) {
			var address = req.params.address,
				room = req.body;
			console.log(arguments);

			var data = ''
			req.on('data', function(chunk) {
				data += chunk.toString();
			});
			req.on('end', function() {
				var message = JSON.parse(data),
					room = message.room;

				invite(address, room);

				res.json({sent:true});
			});
		});
	})(router, rtc);
	

	router.get('/channels', function(req, res) {
		res.json(rtc.rtc.rooms);
	});

	router.get('/log', function(req, res) {
		res.json(log);
	});

	app.use('/', router);

	return callback(webserver, io, rtc);
};

exports.startServer = startServer;
exports.startServer({
	port: 2888,
	rtcport: 2887
}, function(webserver, io, rtc) { });