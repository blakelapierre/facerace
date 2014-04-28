var angular = require('angular'),
	_ = require('lodash');

module.exports = ['socket', 'keys', function(socket, keys) {
	return {
		restrict: 'E',
		template: require('./template.html'),
		link: function($scope, element, attributes) { },
		controller:  [
			'$scope', 'renderService', 'eventsManager', 'playersManager', 'sourcesManager', 'updateManager', 'facerace',
			function($scope, renderService, eventsManager, playersManager, sourcesManager, updateManager, facerace) {

			$scope.$on('sceneReady', function(e, s) {
				if (s.name == 'main') {
					var scene = s.scene,
						cssScene = s.cssScene,
						camera = s.camera,
						controls = s.controls;


					var dispatch = eventsManager.setScene(scene, cssScene),
						livePlayers = playersManager.setScene(scene, cssScene),
						liveSources = sourcesManager.setScene(scene, cssScene),
						livetransport = updateManager.setScene(scene, cssScene, camera);

					renderService.start();
				}
			});
		}]
	};
}];