var startServer = function(config, callback) {
	var express = require('express'),
		socketIO = require('socket.io'),
		webRTC = require('webrtc.io'),
		path = require('path'),
		otj = require('ottypes/lib/json0'),
		_ = require('underscore'),
		app = express();

	app.use(express.static(path.join(__dirname, '/public')));

	console.dir(otj);

	var db = otj.create({
		test: 'value',
		number: 1,
		sub: {
			child: 2
		}
	});

	console.dir(db);

	var db2 = otj.apply(db, [{p:['test'], od: 'value', oi: 'value2'}]);
	console.dir(db);
	console.dir(db2);

	var sub = otj.apply(db.sub, [{p:['child2'], oi: 'woah'}]);
	console.dir(sub);
	console.dir(db);



	var webserver = app.listen(config.port),
		rtc = webRTC.listen(config.rtcport),
		io = socketIO.listen(webserver);

	var db = otj.create({});	

	io.sockets.on('connection', function(socket) {
		socket.on('watch', function(data) {
			var path = data.p,
				obj = db[path] || otj.apply(db, [{p: [path], oi: {}}])[path];

			socket.emit('obj', {p: path, obj: obj});
		});

		socket.on('apply', function(data) {
			var path = data.p,
				ops = data.ops,
				obj = db[path];

			if (obj == null) {
				socket.emit('error', {msg: path + ' doesn\'t exist!', data: data});
				return;
			}

			obj = otj.apply(obj, ops);
			_.each(ops, function(op) {
				console.log(op);
			});

			socket.emit('obj', {p: path, obj: obj});
		});
	});

	return callback(webserver, io, rtc);
};

exports.startServer = startServer;
exports.startServer({
	port: 2888,
	rtcport: 2887
}, function(webserver, io, rtc) {});