var db = require('./db');

var socketIOdb = function(io) {
	io.sockets.on('connection', function(socket) {
		socket.on('live', function(data) {
			var path = data.path,
				endpoint = 'live:' + path;

			var live = db.live(path, function(type, _rev, property, value) {
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
console.log('going live at', path);
	socket.emit('live', {path: path});

	socket.on(endpoint, function(message) {
		console.log(endpoint, message);
		var data = proxy.change(message._rev, message);
		listener(data, message.set, message.remove);
	});

	var change = function(set, remove) {
		socket.emit(endpoint, {type: 'change', set: set, remove: remove});
	};

	var leave = function() {
		socket.emit(endpoint, {type: 'leave'});
	};

	return {
		data: proxy.data,
		change: change,
		leave: leave
	};
};


module.exports = {
	host: socketIOdb,
	proxy: socketIOdbProxy
};