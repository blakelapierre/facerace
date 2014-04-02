var _ = require('lodash'),
	core = require('./core');

module.exports = function(io) {
	var eventQ = [];

	var swapQ = function(newQ) {
		var events = newQ || eventQ;
		eventQ = [];
		return events;
	};

	io.sockets.on('connection', function(socket) {
		socket.on('position', function(data) {
			eventQ.push({socket: socket, type: 'position', data: data});
		});
	});

	return (function(core) {
		return function(additionalEvents) {
			var events = core();
			_.each(events, function(event) {
				event.socket.broadcast({type: event.type, data: event.data})
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