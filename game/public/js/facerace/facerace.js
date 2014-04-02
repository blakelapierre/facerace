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
		player: {
			pre: function(eventQ, player, newPlayer) {
				console.log('players', players);
				return true;
			},
			post: function(eventQ, player, newPlayer) {
				console.log('post player', newPlayer);
				players.push(newPlayer);
			}
		},
		state: {
			pre:function(eventQ, player, state) {
				console.log('pre state', state);
				if (state.state == null) eventQ.push({type: 'state', _player: player, _event: state});
				else {
					state = state.state;

					players = state.players;
					for (var i = 0; i < players; i++) {
						if (player.id == players[i]) break;
					}
					players.splice(i, 1, player);
				}
				return true;
			},
			post: function(eventQ, player, state) {
				if (state.state == null) {
					state.state = {
						players: players
					};
				}
				console.log('post state', state);
			}
		},	
		video: {
			pre: function(eventQ, player, socketID) {
				player.videoSocketID = socketID;
				return true;
			}
		},
		position: {
			pre: function(eventQ, player, position) {
				player.position = position;
				return true;
			}
		}
	};

	var preEventHandlers = {},
		postEventHandlers = {};

	_.each(_.keys(eventHandlers), function(key) {
		_.each(['pre', 'post'], function(hookPoint) {
			var fn = eventHandlers[key][hookPoint] || function() {};
			eventHandlers[key][hookPoint] = function(eventQ, event) {
				return fn(eventQ, event._player, event._event);
			}
		});

		preEventHandlers[key] = eventHandlers[key]['pre'];
		postEventHandlers[key] = eventHandlers[key]['post'];
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
			eventQ.push({type: 'player', _player: player, _event: player});
			eventQ.push({type: 'state', _player: player, _event: {}})
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
		}) : (function(event) {
			io.emit(event.type, event._event);
		});

		return function() {
			var events = core();
			_.each(events, function(event) {
				(postEventHandlers[event.type] || function() { })(null, event);
			});
			_.each(events, broadcast);
			return events;
		};	
	})(core(isServer, preEventHandlers, function() {
		return swapQ();
	}, function(clock) {
		console.log(clock);
	}));
};