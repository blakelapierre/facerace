module.exports = ['$rootScope', function($scope) {
	var w = angular.element(window),
		keymap = {},
		keyHandlers = {};


	function broadcastDown(event) {
		keymap[event.which] = true;
		$scope.$broadcast('keychange', event.which, true);
	}

	function broadcastUp(event) {
		keymap[event.which] = false;
		$scope.$broadcast('keychange', event.which, false);
	}

	function handlersDown(event) {
		keymap[event.which] = true;
		var handler = keyHandlers[event.which];
		if (handler) handler(true);
	}

	function handlersUp(event) {
		keymap[event.which] = false;
		var handler = keyHandlers[event.which];
		if (handler) handler(false);
	}

	function getKeymap() {
		return keymap;
	}

	getKeymap.keymap = keymap;

	w.bind('keydown', broadcastDown);
	w.bind('keyup', broadcastUp);
	
	getKeymap.setMode = (function() {
		var currentDown, currentUp;

		function setHandlers(events) {
			w.unbind('keydown', currentDown);
			w.unbind('keyup', currentUp);

			currentDown = events.down;
			currentUp = events.up;

			w.bind('keydown', currentDown);
			w.bind('keyup', currentUp);
		}

		var modes = {
			'broadcast': { down: broadcastDown, up: broadcastUp },
			'handlers': { down: handlersDown, up: handlersUp }
		};

		return function(mode) {
			setHandlers(modes[mode]);
		};
	})();

	getKeymap.setKeyHandlers = function(handlers) {
		keyHandlers = handlers;
	};

	return getKeymap;
}];