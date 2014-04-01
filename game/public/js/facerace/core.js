module.exports = (function() {
	var clock = 0,
		eventQ = [],
		eventHandlers = {},
		history = {};

	var step = function() {
		clock += 1;
		processEventQ();
		update(clock);
		sendEvents();
	};

	var swapQ = function() {
		var events = eventQ;
		eventQ = [];
		return events;
	};

	var processEventQ = function() {
		var events = swapQ();
		history[clock] = _.filter(events, processEvent);
	};

	var processEvent = function(event) {
		return (eventHandlers[event.type] || falseFn)(event);
	};
	var falseFn = function() { return false; };

	var sendEvents = function() {
		var events = swapQ();
		// probably need to do something else here
		return history[clock].concat(events);
	};

	return {
		eventHandlers: eventHandlers,
		step: step
	};
})();