module.exports = (function() {
	var clock = 0,
		eventQ = []
		history = {};


	var step = function() {
		clock += 1;
		processEventQ();
		update();
		sendEvents();
	};

	var processEventQ = function() {
		var events = eventQ;
		eventQ = [];

		for (var i = 0; i < eventQ.length; i++) {
			processEvent(events[i]);
		}
	};

	var processEvent = function(event) {
		var valid = false;
		switch(event.type) {
			case 'input':
				valid = processInputEvent(event);
				break;
		}
	};

	var processInputEvent = function(inputEvent) {

	};
})();