var _ = require('lodash'),
	core = require('./core');

module.exports = function(io, onEvent) {
	var eventQ = [],
		sockets = {},
		players = [];

	var swapQ = function(newQ) {
		var events = newQ || eventQ;
		eventQ = [];
		return events;
	};

	onEvent = onEvent(); //compile?

	var newPlayer = function(socket) {
		var player = {
			id: socket.id,
			position: [0,0,0]
		};

		players.push(player);

		eventQ.push({type: 'player', data: player});

		return player;
	};

	io.sockets.on('connection', function(socket) {
		console.log(socket.id);

		sockets[socket.id] = socket;
		
		var player = newPlayer(socket);

		socket.on('position', function(data) {
			eventQ.push({player: player, type: 'position', data: data});
			onEvent(data);
		});
	});

	return (function(core) {
		var broadcast = function(player, type, data) {
			_.each(players, function(p) {
				if (player != p) sockets[p.id].emit(type, data);
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
		player: function(event) {
			var player = event.data;
			console.log('player joined', player);

			return true;
		},
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