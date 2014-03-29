var startServer = function(config, callback) {
	var express = require('express'),
		socketIO = require('socket.io'),
		webRTC = require('webrtc.io'),
		path = require('path'),
		otj = require('ottypes/lib/json0'),
		app = express();

	app.use(express.static(path.join(__dirname, '/public')));

	// console.dir(otj);

	// var db = otj.create({
	// 	test: 'value',
	// 	number: 1,
	// 	sub: {
	// 		child: 2
	// 	}
	// });

	// console.dir(db);

	// var db2 = otj.apply(db, [{p:['test'], od: 'value', oi: 'value2'}]);
	// console.dir(db);
	// console.dir(db2);

	// var sub = otj.apply(db.sub, [{p:['child2'], oi: 'woah'}]);
	// console.dir(sub);
	// console.dir(db);

	var webserver = app.listen(config.port),
		rtc = webRTC.listen(config.rtcport),
		io = socketIO.listen(webserver);

	io.sockets.on('connection', function(socket) {
		socket.on('watch', function(data) {
			var path = data.path;
		});
	});

	return callback(webserver, io, rtc);
};

exports.startServer = startServer;
exports.startServer({
	port: 3000,
	rtcport: 3001
}, function(webserver, io, rtc) {});