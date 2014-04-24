var http = require('request'),
	nodemailer = require('nodemailer');

module.exports = function(router, manager, config) {

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
}