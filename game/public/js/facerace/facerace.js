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
		state: function(player, state) {
			console.log('state', state);
			if (state.state == null) {
				state.state = {
					players: players
				};
			}
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
			return fn(e._player, e._event);
		};
	});

	var hookSocket = function(socket) {
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
				onEvent(players, event);
			});
		});

		if (isServer) {
			var event = {type: 'player', _player: player, _event: player};
			eventQ.push(event);
		}
		else {
			var event = {type: 'state', _player: player, _event: {}};
			eventQ.push(event);
		}
	};

	if (isServer) io.sockets.on('connection', hookSocket);
	else hookSocket(io);

	return (function(core) {
		var broadcast = isServer ? (function(event) {
			var player = event._player;
			_.each(players, function(p) {
				if (player != p) sockets[p.id].emit(event.type, event._event);
			});
		}) : (function(player, type, data) {
			console.log('client');
		});

		return function(additionalEvents) {
			var events = core();
			_.each(events.concat(additionalEvents || []), broadcast);
			return events;
		};	
	})(core(isServer, eventHandlers, function() {
		return swapQ();
	}, function(clock) {
		console.log(clock);
	}));
};