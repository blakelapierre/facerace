/*

	Provides access to the keyboad.

	The service is a function. Call the function to get a live-hash showing you the status 
	of every key. If a key doesn't exist in the hash, it is assumed to be 'up'/false. It just 
	means the key has never been pushed since the Service started.

	By default the service will $broadcast the 'keychange' event/message with the keycode 
	that just changed status as well as the up/down status.

	You can supply your own key handlers and skip the $broadcast like so:

	keyboard.setMode('handlers');
	keyboard.setKeyHandlers({
		192: function(down) {
			if (down) $scope.showDebug = !$scope.showDebug;
		}
	});

	The object you pass into `setKeyHandlers`, is also live. Meaning you can swap out the 
	functions you assigned to each key and the next time the key changes status, that 
	function will be called automatically.

*/

module.exports = ['$rootScope', function keyboard($scope) {
	var w = angular.element(window),
		keymap = {},
		keyHandlers = {};


	function broadcastDown(event) {
		keymap[event.which] = true;
		$scope.$broadcast('keychange', event.which, true);
	};

	function broadcastUp(event) {
		keymap[event.which] = false;
		$scope.$broadcast('keychange', event.which, false);
	};

	function handlersDown(event) {
		keymap[event.which] = true;
		var handler = keyHandlers[event.which];
		if (handler) handler(true);
	};

	function handlersUp(event) {
		keymap[event.which] = false;
		var handler = keyHandlers[event.which];
		if (handler) handler(false);
	};

	function getKeymap() {
		return keymap;
	};


	w.bind('keydown', broadcastDown);
	w.bind('keyup', broadcastUp);


	getKeymap.keymap = keymap;
	
	getKeymap.setMode = (function() {
		var currentDown, currentUp;

		function setHandlers(events) {
			w.unbind('keydown', currentDown);
			w.unbind('keyup', currentUp);

			currentDown = events.down;
			currentUp = events.up;

			w.bind('keyup', currentUp);
			w.bind('keydown', currentDown);
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