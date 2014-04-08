var _ = require('lodash');

module.exports = function(isServer, eventHandlers, getEventsFn, updateFn) {
	var clock = 0,
		eventQ = [],
		history = {};

	var swapQ = function(newQ) {
		var events = newQ || eventQ;
		eventQ = [];
		return events;
	};

	var defaultHandler = function() { return false; };

	var processEventQ = function() {
		var events = swapQ(getEventsFn());
		history[clock] = _.filter(events, function(event) { // we will want to pick these off of the history object probably
			return (eventHandlers[event.type] || defaultHandler)(eventQ, event);
		});
	};

	var tick = function() {
		clock += 1;

		processEventQ();
		
		updateFn(clock);

		return swapQ();
	};

	return isServer ? function() { return tick().concat(history[clock]); } : tick;
};