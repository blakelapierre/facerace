var core = require('./core');

module.exports = function(io) {
	var eventHandlers = {
		message: function(event) {
			console.log(event);
			return true;
		}
	};

	var getEvents = function() {
		return [{type: 'message'}];
	};

	var update = function(clock) {
		console.log(clock);
	};

	return (function(core) {
		return function(additionalEvents) {
			var events = core();
			return events;
		};	
	})(core(eventHandlers, getEvents, update));
};