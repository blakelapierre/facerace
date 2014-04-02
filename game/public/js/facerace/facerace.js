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

	var addPlayer = function(socket) {
		return {
			id: socket.id,
			socket: socket,
			position: [0,0,0]
		};
	};

	io.sockets.on('connection', function(socket) {
		console.log(socket.id);
		var player = addPlayer(socket);
		players.push(player);

		socket.on('position', function(data) {
			eventQ.push({player: player, type: 'position', data: data});
			onEvent(data);
		});
	});

	return (function(core) {
		var broadcast = function(player, type, data) {
			_.each(players, function(p) {
				if (player != p) p.socket.emit(type, data);
			});
		};

		return function(additionalEvents) {
			var events = core();
			_.each(events, function(event) {
				broadcast(event.player, event.type, event.data);
			});
			return events;
		};	
	})(core({
		position: function(event) {
			var data = event.data;
				player = event.player;

			player.position = data;
			console.log('position', player.position);
			return true;
		}
	}, function() {
		return swapQ();
	}, function(clock) {
		console.log(clock);
	}));
};