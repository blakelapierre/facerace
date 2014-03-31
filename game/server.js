var startServer = function(config, callback) {
	var express = require('express'),
		socketIO = require('socket.io'),
		webRTC = require('webrtc.io'),
		path = require('path'),
		otj = require('ottypes/lib/json0'),
		_ = require('lodash'),
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

	var db = {};

	var watch = function(path, callback) {
		path = path.join('.');

		var doc = db[path] || create(path);

		doc.listeners.push(callback);

		db[path] = doc;
		return doc;
	};

	var create = function(path) {
		return {
			path: path,
			listeners: [],
			data: otj.create({}),
			version: 0
		};
	};

	var apply = function(path, operations) {
		path = path.join('.');

		var doc = db[path];
		
		doc.data = otj.apply(doc.data, operations);
		doc.version++;

		_.each(doc.listeners, function(callback) { callback(path, operations); });

		return doc;
	};

	var change = function(path, object) {
		console.log(arguments);
	};
	otj.on('move', change);
	otj.on('set', change);
	otj.on('delete', change);

	_.extend(db, {
		watch: watch,
		create: create,
		apply: apply
	});
  
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
	});

	return callback(webserver, io, rtc);
};

exports.startServer = startServer;
exports.startServer({
	port: 2888,
	rtcport: 2887
}, function(webserver, io, rtc) {});