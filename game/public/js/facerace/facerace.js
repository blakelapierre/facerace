var _ = require('lodash'),
	core = require('./core');

module.exports = function(io, onEvent) {
	var eventQ = [];

	var swapQ = function(newQ) {
		var events = newQ || eventQ;
		eventQ = [];
		return events;
	};

	onEvent = onEvent(); //compile?

	io.sockets.on('connection', function(socket) {
		console.log(socket.id);
		socket.on('position', function(data) {
			eventQ.push({socket: socket, type: 'position', data: data});
			onEvent(data);
		});
	});

	return (function(core) {
		return function(additionalEvents) {
			var events = core();
			_.each(events, function(event) {
				event.socket.broadcast(event.type, event.data);
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
			console.log(data);
		}
	}, function() {
		return swapQ();
	}, function(clock) {
		console.log(clock);
	}));
};