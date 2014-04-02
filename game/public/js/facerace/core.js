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

	var processEventQ = function() {
		var events = swapQ(getEventsFn());
		history[clock] = _.filter(events, function(event) {
			return (eventHandlers[event.type] || function() { return false; })(eventQ, event);
		});
	};

	return function() {
		clock += 1;

		processEventQ();
		
		updateFn(clock);

		var events = swapQ();
		return isServer ? history[clock].concat(events) : events; // move this out of the function!
	};
};