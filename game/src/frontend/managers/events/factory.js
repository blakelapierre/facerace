module.exports = ['$rootScope', 'mapLoader', 'playersManager', function($scope, mapLoader, playersManager) {
	var scene, cssScene, eventHandlers;

	function startQuakeMode () {
		playersManager.setMode('quake');
	};

	function dispatch (event) {
		console.log('e', event);
		(eventHandlers[event.type] || function() { })(event);
	};

	return {
		setScene: function(s, cs) {
			if (scene) {} // detach?
			scene = s;
			cssScene = cs;

			eventHandlers = {
				mode: function(event) {
					var mode = event._event;

					switch (mode) {
						case 'quake':
							startQuakeMode();
							break;
					}
				},
				player: function(event) {
					console.log('player', event);
				},
				video: function(event) {
					console.log('video', event);
				},
				setMap: function(event) {
					mapLoader(scene, event._event);
				}
			};

			return dispatch;
		},
		dispatch: dispatch
	};
}];