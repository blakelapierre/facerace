var core = require('./core');

module.exports = function(io) {
	return (function(core) {
		return function(additionalEvents) {
			var events = core();
			return events;
		};	
	})(core({
		message: function(event) {
			console.log(event);
			return true;
		}
	}, function() {
		return [{type: 'message'}];
	}, function(clock) {
		console.log(clock);
	}));
};