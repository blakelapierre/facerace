var db = require('./db');


	// var hook = function (obj) {
	// 	for (var key in obj) {
	// 		var thisKey = key;
			
	// 		obj.__defineGetter__(key, function() {
	// 			return obj[thisKey];
	// 		});

	// 		obj.__defineSetter__(key, function(value) {
	// 			obj[thisKey] = value;
	// 		});
	// 	}
	// };



  

var socketIOdb = function(io) {
	io.sockets.on('connection', function(socket) {
		// var watch = function(data) {
		// 	var doc = db.watch(data.p, function(path, operations) {
		// 		socket.emit('apply', {p: path, ops: operations});
		// 	});

		// 	socket.emit('data', {path: path, doc: doc});
		// };

		// var apply = function(data) {
		// 	var path = data.p,
		// 		operations = data.ops,
		// 		doc = db.apply(path, operations);
		// 	console.dir(doc);
		// };

		// socket.on('watch', watch);
		// socket.on('apply', apply);

		socket.on('live', function(data) {
			var path = data.path,
				endpoint = 'live:' + path;

			var live = db.live(path, function(_rev, type, property, value) {
				socket.emit(endpoint, {
					_rev: _rev,
					type: type,
					set: property.set,
					remove: property.remove
				});
			});

			var listener = function(data) {
				if (data.type == 'change') live.change(data);
				else if (data.type == 'leave') {
					socket.removeListener(endpoint, listener);
					live.leave();
				}
			};
			socket.on(endpoint, listener);

			socket.emit(endpoint, {
				type: 'change',
				_rev: live._rev,
				set: live.data
			});
		});
	});
};

var socketIOdbProxy = function(socket, path, listener) {
	var proxy = db.liveProxy(path),
		endpoint = 'live:' + path;

	socket.emit('live', {path: path});

	socket.on(endpoint, function(message) {
		var data = test.change(message._rev, message);
		listener(data, message.set, message.remove);
	});

	var set = function(toSet, toRemove) {
		socket.emit(endpoint, {type: 'change', set: toSet, remove: toRemove});
	};

	var leave = function() {
		socket.emit(endpoint, {type: 'leave'});
	};

	return {
		snapshot: proxy.data,
		set: set,
		leave: leave
	};
};


module.exports = {
	host: socketIOdb,
	proxy: socketIOdbProxy
};