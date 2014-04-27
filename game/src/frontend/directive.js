var angular = require('angular'),
	_ = require('lodash'),
	math = require('mathjs')(),
	facerace = require('../sim/facerace');

module.exports = ['socket', 'keys', function FaceraceDirective (socket, keys) {
	return {
		restrict: 'E',
		template: require('./template.html'),
		link: function($scope, element, attributes) { },
		controller:  ['$scope', 'orientation', 'mapLoader', 'playerManager', 'sourcesManager', function($scope, orientation, mapLoader, playerManager, sourcesManager) {
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
						_.each($scope.liveSources, function(source) {
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


				var livePlayers = playerManager.setScene(scene, cssScene),
					liveSources = sourcesManager.setScene(scene, cssScene);

				$scope.$on('updateScene', (function() {
					var waitingForState = function(transport, now, dt) {
						if (transport.state._yourID != null) {
							updateFn = haveState;
							if (transport.state.map) mapLoader(scene, transport.state.map);
						}
					};

					var haveState = (function () {
						var hasOrientationChanged = (function() {
							var lastOrientation = {
								quaternion: [0, 0, 0, 1]
							};

							return function(orientation) {
								var q = orientation.quaternion,
									lq = lastOrientation.quaternion;

								if (q[0] == lq[0] && q[1] == lq[1] && q[2] == lq[2] && q[3] == lq[3]) return false;

								lq[0] = q[0];
								lq[1] = q[1];
								lq[2] = q[2];
								lq[3] = q[3];

								return true;
							};
						})();

						var maxfps = 30,
							lastControlUpdate = new Date().getTime(),
							controlUpdatesPerSecond = 4;

						return function(transport, now, dt) {
							$scope.$broadcast('newState', transport);

							$scope.stateObj = transport.state;

							var player = livePlayers[transport.state._yourID];
							if (player) camera.lookAt(player.mesh.position);

							_.each(liveSources, function(source, id) {
								var element = source.element;
								if (element.readyState == element.HAVE_ENOUGH_DATA &&
									now - source.texture.lastUpdate > (1000 / maxfps) ) {
									source.texture.needsUpdate = true;
									source.texture.lastUpdate = now;
								}
								source.material.uniforms.time.value += 1;
							});

							$scope.players = transport.state.players;

							if (now - lastControlUpdate > (1000 / controlUpdatesPerSecond)) {
								var o = orientation();

								if (hasOrientationChanged(o)) facerace.orientation(o);

								lastControlUpdate = now;
							}

							_.each(transport.events.processedEvents, dispatch);

							_.each(livePlayers, function(player) {
								var data = player.data,
									q = data.orientation.quaternion,
									tq = player.targetQuaternion,
									mesh = player.mesh,
									mq = mesh.quaternion;

								tq.set(q[0], q[1], q[2], q[3]);
								mq.slerp(tq, 0.05);
							});

							$scope.$apply();
						};
					})();

					var updateFn = waitingForState;	

					var lastFrame = new Date().getTime(),
						transport = {};
					return function () {
						var now = new Date().getTime(),
							dt = now - lastFrame;

						transport = facerace(transport);

						updateFn(transport, now, dt);

						lastFrame = now;
					};
				})());
			});
		}]
	};
}];