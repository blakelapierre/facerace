module.exports = (function(eventHandlers, updateFn) {
	var clock = 0,
		eventQ = [],
		history = {};

	var step = function() {
		clock += 1;
		processEventQ();
		updateFn(clock);
		return sendEvents();
	};

	var swapQ = function() {
		var events = eventQ;
		eventQ = [];
		return events;
	};

	var processEventQ = function() {
		var events = swapQ();
		history[clock] = _.filter(events, function(event) {
			return (eventHandlers[event.type] || function() { return false; })(event);
		});
	};

	var sendEvents = function() {
		var events = swapQ();
		return history[clock].concat(events);
	};

	return {
		eventHandlers: eventHandlers,
		step: step
	};
})();