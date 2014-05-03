module.exports = ['$rootScope', function($scope) {
	var w = angular.element(window),
		keymap = {},
		keyHandlers = {},
		currentUp, currentDown;


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
	
	getKeymap.setScopeBroadcast = function(shouldBroadcast) {
		if (shouldBroadcast) {
			w.unbind('keydown', currentDown);
			w.unbind('keyup', currentUp);

			currentDown = broadcastDown;
			currentUp = broadcastUp;

			w.bind('keydown', currentDown);
			w.bind('keyup', currentUp);
		}
		else {
			w.unbind('keydown', currentDown);
			w.unbind('keyup', currentUp);
			
			currentDown = handlersDown;
			currentUp = handlersUp;

			w.bind('keydown', currentDown);
			w.bind('keyup', currentUp);
		}
	};

	getKeymap.setKeyHandlers = function(handlers) {
		keyHandlers = handlers;
	};

	return getKeymap;
}];