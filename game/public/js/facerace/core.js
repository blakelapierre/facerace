var _ = require('lodash');

module.exports = function(eventHandlers, getEventsFn, updateFn) {
	var clock = 0,
		eventQ = [];

	var swapQ = function(newQ) {
		var events = newQ || eventQ;
		eventQ = [];
		return events;
	};

	var defaultHandler = function() { console.log('default', arguments); return false; };

	var processEventQ = function() {
		var events = swapQ(getEventsFn());
		return _.filter(events, function(event) {
			event._c = clock;
			return (eventHandlers[event.type] || defaultHandler)(eventQ, event);
		});
	};

	var tick = function(transport) {
		clock += 1;

		transport.clock = clock;

		transport.processedEvents = processEventQ();

		updateFn(clock);

		transport.outgoingEvents = swapQ();

		return transport;
	};

	return tick;
};