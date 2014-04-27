var angular = require('angular'),
	_ = require('lodash'),
	math = require('mathjs')(),
	facerace = require('../sim/facerace');

module.exports = ['socket', 'keys', function FaceraceDirective (socket, keys) {
	return {
		restrict: 'E',
		template: require('./template.html'),
		link: function($scope, element, attributes) { },
		controller:  [
			'$scope', 'orientation', 'mapLoader', 'playersManager', 'sourcesManager', 'updateManager',
			function($scope, orientation, mapLoader, playersManager, sourcesManager, updateManager) {

			$scope.$on('sceneReady', function(e, s) {
				console.log('scene', s);

				var scene = s.scene,
					cssScene = s.cssScene,
					camera = s.camera,
					controls = s.controls,
					swirl = window.location.hash.indexOf('-swirl') > -1 ? '-swirl' : '';

				facerace = facerace(false, rtc, socket);

				$scope.toggleMode = function() {
					$scope.mode = $scope.mode == 'testMode' ? '' : 'testMode';
					facerace.mode($scope.mode);
				};

				var eventHandlers = {
					mode: function(event) {
						_.each(liveSources, function(source) {
							source.mode = event._event;

							var swirl = (source.mode == 'testMode' ? '-swirl' : '');
							var video = source.element,
								width = 1,
								height = 1,
								material = new THREE.ShaderMaterial({
									fragmentShader: document.getElementById('plane-fragment-shader' + swirl).textContent,
									vertexShader: document.getElementById('plane-vertex-shader' + swirl).textContent,
									uniforms: {
										texture: {type: 't', value: source.texture},
										width: {type: 'f', value: width},
										height: {type: 'f', value: height},
										radius: {type: 'f', value: 2},
										angle: {type: 'f', value: 0.8},
										center: {type: 'v2', value: new THREE.Vector2(width / 2, height / 2)},
										time: {type: 'f', value: 1.0}
									},
									side: THREE.DoubleSide
								});

							source.material = material;
							source.mesh.material = material;
						});
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

				var dispatch = function(event) {
					console.log('e', event);
					(eventHandlers[event.type] || function() { })(event);
				};

				$scope.setMap = function(map) {
					facerace.setMap(map);
					$scope.showMaps = false;
				};

				$scope.$watch('showMaps', function(newValue) {
					controls.enabled = !newValue;
				});


				var livePlayers = playersManager.setScene(scene, cssScene),
					liveSources = sourcesManager.setScene(scene, cssScene, facerace),
					transport = updateManager.setScene(scene, cssScene, facerace, livePlayers, liveSources, camera, orientation, dispatch);
			});
		}]
	};
}];