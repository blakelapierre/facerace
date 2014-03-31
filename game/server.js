var startServer = function(config, callback) {
	var express = require('express'),
		socketIO = require('socket.io'),
		webRTC = require('webrtc.io'),
		path = require('path'),
		otj = require('ottypes/lib/json0'),
		_ = require('lodash'),
		db = require('./public/js/db'),
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

	var hook = function (obj) {
		for (var key in obj) {
			var thisKey = key;
			
			obj.__defineGetter__(key, function() {
				return obj[thisKey];
			});

			obj.__defineSetter__(key, function(value) {
				obj[thisKey] = value;
			});
		}
	};



  
	io.sockets.on('connection', function(socket) {
		var watch = function(data) {
			var doc = db.watch(data.p, function(path, operations) {
				socket.emit('apply', {p: path, ops: operations});
			});

			socket.emit('data', {path: path, doc: doc});
		};

		var apply = function(data) {
			var path = data.p,
				operations = data.ops,
				doc = db.apply(path, operations);
			console.dir(doc);
		};

		socket.on('watch', watch);
		socket.on('apply', apply);

		socket.on('live', function(data) {
			console.log(data);
			var path = data.path,
				endpoint = 'live:' + path;

			var callback = function(_rev, type, property, value) {
				socket.emit(endpoint, {
					_rev: _rev,
					type: type,
					set: property.set,
					remove: property.remove
				});
			};

			var live = db.live(path, callback);

			var listener = function(data) {
				console.log(data);
				if (data.type == 'change') live.change(data);
				else if (data.type == 'leave') {
					socket.removeListener('live:' + path, listener);
					live.leave();
				}
			};

			socket.on(endpoint, listener);

			var snapshot = live.snapshot,
				_rev = snapshot._rev;

			socket.emit(endpoint, {
				type: 'snapshot',
				_rev: _rev,
				data: snapshot.data
			});
		});
	});

	return callback(webserver, io, rtc);
};

exports.startServer = startServer;
exports.startServer({
	port: 2888,
	rtcport: 2887
}, function(webserver, io, rtc) {});