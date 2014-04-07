var _ = require('lodash'),
	core = require('./core');

module.exports = function(isServer, rtc, io, onEvent) {
	var eventQ = [],
		sockets = {},
		state = {
			state: {
				players: {}
			}
		},
		stateEvents = []; // *ONLY* used to keep track that we need to send the full state to incoming sockets *after* we process their entry to the game.
		//NEVER USE FOR ANYTHING ELSE ^^^^^ TRY TO GET RID OF IT!

	var getState = function() {
		return state.state;
	};

	var setState = function(newState) {
		if (newState.state == null) new Error('!!!!');
		state.state = newState;
	};

	var swapQ = function(newQ) {
		var events = newQ || eventQ;
		eventQ = [];
		return events;
	};

	onEvent = onEvent(); //compile?

	var eventHandlers = {
		state: {
			pre: function(eventQ, player, newState) {
				setState(newState);
				return false;
			}
		},	
		player: {
			pre: function(eventQ, player, newPlayer) {
				var state = getState();
				state.players[newPlayer.id] = newPlayer;
				return true;
			}
		},
		playerLeave: {
			post: function(eventQ, player, id) {
				var state = getState();
				delete state.players[id];
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
			var fn = eventHandlers[key][hookPoint] || function() { return true; };
			eventHandlers[hookPoint][key] = function(eventQ, event) {
				return fn(eventQ, event._player, event._event);
			}
		});
	});

	var hookSocket = function(socket) {
		sockets[socket.id || 'local'] = socket;

		if (isServer) {
			var player = {
				id: socket.id,
				position: [0,0,0]
			};

			socket.player = player;
			
			var event = {type: 'player', _player: player, _event: player};
			eventQ.push(event);
			stateEvents.push(function() {
				var state = getState();
				socket.emit('state', {_event: _.extend({_yourID: player.id}, state)});
				console.log('<-- sent state', state);
			});
			onEvent(state, event);

			socket.on('disconnect', function(data) {
				var state = getState(),
					event = {type: 'playerLeave', _player: player, _event: player.id};
				eventQ.push(event);
				onEvent(state, event);
			});
		}

		_.each(_.keys(eventHandlers), function(key) {
			if (isServer) {
				var player = socket.player;
				socket.on(key, function(event) {
					console.log('incoming -->', key, event);
					eventQ.push({type: key, _player: player, _event: event});
					onEvent(getState(), event);
				});
			}
			else {
				socket.on(key, function(event) {
					console.log('incoming -->', key, event);
					var state = getState(),
						player = state.players[event._fromID];
					eventQ.push({type: key, _player: player, _event: event._event});
					onEvent(state, event);
				});
			}	
		});
	};

	if (isServer) io.sockets.on('connection', hookSocket);
	else hookSocket(io);

	return (function(core) {
		var broadcast = isServer ? (function(event) {
			var state = getState(),
				player = event._player,
				clientEvent = {_fromID: player.id, _event: event._event};
			console.log('<-- outgoing', event.type, clientEvent);
			_.forOwn(state.players, function(p, playerID) {
				if (player.id != playerID) sockets[playerID].emit(event.type, clientEvent);
			});
		}) : (function(event) {
			console.log('<-- outgoing', event.type, event._event);
			io.emit(event.type, event._event);
		});

		var serverExtensions = {},
			clientExtensions = {
				video: function(socketID) { // we should be able to generate this?!
					var state = getState();

					io.emit('video', socketID);
					var event = {type: 'video', _player: state.players[state._yourID], _event: socketID};
					console.log('self send', event);
					eventQ.push(event);
				}
			};

		return _.extend(function() {
			if (eventQ.length == 0) return {state: getState(), events: null};
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
		}, isServer ? serverExtensions : clientExtensions);	
	})(core(isServer, eventHandlers.pre, function() {
		return swapQ();
	}, function(clock) {
		// console.log(clock);
	}));
};