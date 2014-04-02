var _ = require('lodash'),
	core = require('./core');

module.exports = function(io, onEvent) {
	var eventQ = []
		players = [];

	var swapQ = function(newQ) {
		var events = newQ || eventQ;
		eventQ = [];
		return events;
	};

	onEvent = onEvent(); //compile?

	io.sockets.on('connection', function(socket) {
		console.log(socket.id);
		players.push(socket);

		socket.on('position', function(data) {
			eventQ.push({socket: socket, type: 'position', data: data});
			onEvent(data);
		});
	});

	return (function(core) {
		var broadcast = function(socket, type, data) {
			_.each(players, function(s) {
				if (socket != s) s.emit(type, data);
			});
		};

		return function(additionalEvents) {
			var events = core();
			_.each(events, function(event) {
				console.log(event);
				broadcast(event.socket, event.type, event.data);
			});
			return events;
		};	
	})(core({
		message: function(event) {
			console.log(event);
			return true;
		},
		position: function(event) {
			var data = event.data;
			console.log('position', data);
			return true;
		}
	}, function() {
		return swapQ();
	}, function(clock) {
		console.log(clock);
	}));
};