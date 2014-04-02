var _ = require('lodash'),
	core = require('./core');

module.exports = function(isServer, rtc, io, onEvent) {
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
		player: function(player, newPlayer) {
			players.push(newPlayer);
			console.log('players', players);
			return true;
		},
		video: function(player, socketID) {
			player.videoSocketID = socketID;
			return true;
		},
		position: function(player, position) {
			player.position = position;
			return true;
		}
	};

	_.each(_.keys(eventHandlers), function(key) {
		var fn = eventHandlers[key];
		eventHandlers[key] = function(e) {
			fn(e._player, e._event);
		};
	});

	io.sockets.on('connection', function(socket) {
		console.log(socket.id);

		sockets[socket.id] = socket;

		var player = {
			id: socket.id,
			position: [0,0,0]
		};

		_.each(_.keys(eventHandlers), function(key) {
			socket.player = player;

			socket.on(key, function(event) {
				console.log(key, event);
				eventQ.push({type: key, _player: socket.player, _event: event});
				onEvent(event);
			});
		});

		eventQ.push({type: 'player', _player: player, _event: player});
		onEvent({});
	});

	return (function(core) {
		var broadcast = isServer ? (function(player, type, data) {
			_.each(players, function(p) {
				if (player != p) sockets[p.id].emit(type, data);
			});
		}) : (function(player, type, data) {

		});

		return function(additionalEvents) {
			var events = core();
			_.each(events.concat(additionalEvents || []), function(event) {
				broadcast(event._player, event.type, event.data);
			});
			console.log(players);
			return events;
		};	
	})(core(isServer, eventHandlers, function() {
		return swapQ();
	}, function(clock) {
		console.log(clock);
	}));
};