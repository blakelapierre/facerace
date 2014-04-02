var _ = require('lodash'),
	core = require('./core');

module.exports = function(rtc, io, onEvent) {
	var eventQ = [],
		sockets = {},
		players = [];

	var swapQ = function(newQ) {
		var events = newQ || eventQ;
		eventQ = [];
		return events;
	};

	onEvent = onEvent(); //compile?

	var eventHandlers = {
		player: function(player, event) {
			var player = event.data;
			console.log('player joined', player);

			return true;
		},
		video: function(player, event) {
			var data = event.data;
		},
		position: function(player, position) {
			player.position = position;
			console.log('position', player.position);
			return true;
		}
	};

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

		_.each(_.keys(eventHandlers), function(key) {
			var fn = eventHandlers[key];

			socket.on(key, function(event) {
				fn(player, event);
			});
		});

		console.log(rtc.rtc.rooms);
	});

	return (function(core) {
		var broadcast = function(player, type, data) {
			_.each(players, function(p) {
				if (player != p) sockets[p.id].emit(type, data);
			});
		};

		return function(additionalEvents) {
			var events = core();
			_.each(events.concat(additionalEvents || []), function(event) {
				broadcast(event._player, event.type, event.data);
			});
			return events;
		};	
	})(core(eventHandlers, function() {
		return swapQ();
	}, function(clock) {
		console.log(clock);
	}));
};