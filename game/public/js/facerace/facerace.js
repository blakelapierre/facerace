var core = require('./core');

module.exports = function(io) {
	var eventHandlers = {
		message: function(event) {
			console.log(event);
		}
	};

	var getEvents = function() {
		return [{type: 'message'}];
	};

	var update = function(clock) {
		console.log(clock);
	};

	return core(eventHandlers, getEvents, update);
};