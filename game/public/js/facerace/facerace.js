var _ = require('lodash'),
	core = require('./core');

module.exports = function(isServer, rtc, io, onEvent) {
	var eventQ = [],
		sockets = {},
		state = {
			players: []
		},
		stateEvents = []; // *ONLY* used to keep track that we need to send the full state to incoming sockets *after* we process their entry to the game.
		//NEVER USE FOR ANYTHING ELSE ^^^^^ TRY TO GET RID OF IT!

	var swapQ = function(newQ) {
		var events = newQ || eventQ;
		eventQ = [];
		return events;
	};

	onEvent = onEvent(); //compile?

	var eventHandlers = {
		state: {
			pre: function(eventQ, player, newState) {
				console.log('pre state', newState);
				if (newState.state == null) new Error('!!!!');
				state = newState;
				console.log('SET STATE TO', state);
				return false;
			}
		},	
		player: {
			pre: function(eventQ, player, newPlayer) {
				console.log('players', state.players);
				return true;
			},
			post: function(eventQ, player, newPlayer) {
				console.log('post player', newPlayer);
				state.players.push(newPlayer);
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

	_.each(['pre', 'post'], function(hookPoint) {
		eventHandlers[hookPoint] = {};
		_.each(_.keys(eventHandlers), function(key) {
			var fn = eventHandlers[key][hookPoint] || function() {};
			eventHandlers[hookPoint][key] = function(eventQ, event) {
				return fn(eventQ, event._player, event._event);
			}
		});
	});
	console.log(eventHandlers);

	var hookSocket = function(socket) {
		sockets[socket.id || 'local'] = socket;

		_.each(_.keys(eventHandlers), function(key) {
			if (isServer) {
				var player = {
					id: socket.id,
					position: [0,0,0]
				};
				socket.player = player;

				socket.on(key, function(event) {
					console.log(key, event);
					eventQ.push({type: key, _player: player, _event: event});
					onEvent(state, event);
				});
			}
			else {
				socket.on(key, function(event) {
					console.log(key, event);
					var player = _.find(state.players, function(p) { return p.id == event._fromID; });
					eventQ.push({type: key, _player: player, _event: event._event});
					onEvent(state, event);
				});
			}	
		});

		if (isServer) {
			var player = socket.player;
			eventQ.push({type: 'player', _player: player, _event: player});
			stateEvents.push(function() {
				socket.emit('state', {_event: _.extend({_yourID: player.id}, state)});
			});
		}
	};

	if (isServer) io.sockets.on('connection', hookSocket);
	else hookSocket(io);

	return (function(core) {
		var broadcast = isServer ? (function(event) {
			var player = event._player,
				clientEvent = {_fromID: player.id, _event: event._event};
			_.each(state.players, function(p) {
				if (player !== p) sockets[p.id].emit(event.type, clientEvent);
			});
		}) : (function(event) {
			io.emit(event.type, event._event);
		});

		return function() {
			var events = core();
			_.each(events, function(event) {
				(eventHandlers.post[event.type] || function() { })(null, event);
			});
			_.each(stateEvents, function(event) { event(); });
			_.each(events, broadcast);
			stateEvents = [];
			return {
				state: state,
				events: events
			};
		};	
	})(core(isServer, eventHandlers.pre, function() {
		return swapQ();
	}, function(clock) {
		// console.log(clock);
	}));
};