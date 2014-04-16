var angular = require('angular'),
	_ = require('lodash'),
	math = require('mathjs')(),
	facerace = require('./facerace/facerace');

module.exports = ['socket', function FaceraceDirective (socket) {
	return {
		restrict: 'E',
		template: require('./faceraceTemplate.html'),
		link: function($scope, element, attributes) { },
		controller:  ['$scope', 'orientation', function($scope, orientation) {
			$scope.$on('sceneReady', function(e, s) {
				console.log('scene', s);

				var scene = s.scene,
					cssScene = s.cssScene,
					camera = s.camera,
					controls = s.controls,
					swirl = window.location.hash.indexOf('-swirl') > -1 ? '-swirl' : '';

				var loadMap = (function() {
					var skybox, course;

					var loadCubeMap = function(map) {
						var urls = _.map(['px', 'nx', 'py', 'ny', 'pz', 'nz'], function(face) {
							return '/images/' + map + '/cubemap-' + face + '.png';
			            });

			            return THREE.ImageUtils.loadTextureCube(urls);
					};

					return function(map) {
						if ($scope.map == map) return;
						$scope.map = map;

						if (skybox) scene.remove(skybox);

						var cubemap = loadCubeMap(map);

				        var shader = THREE.ShaderLib[ "cube" ];
				        shader.uniforms[ "tCube" ].value = cubemap;

				        var material = new THREE.ShaderMaterial( {
				          fragmentShader: shader.fragmentShader,
				          vertexShader: shader.vertexShader,
				          uniforms: shader.uniforms,
				          depthWrite: false,
				          side: THREE.DoubleSide
				        });

				        skybox = new THREE.Mesh( new THREE.CubeGeometry( 10000, 10000, 10000 ), material );
				        scene.add(skybox);
					};
				})();
	            

				facerace = facerace(false, rtc, socket);

				$scope.toggleMode = function() {
					$scope.mode = $scope.mode == 'testMode' ? '' : 'testMode';
					facerace.mode($scope.mode);
				};

				var slider = document.createElement('input');
				slider.type = 'range';

				var sliderObj = new THREE.CSS3DObject(slider);
				cssScene.add(sliderObj);

				var material = new THREE.MeshBasicMaterial();

				material.color.set('black');
				material.opacity = 0;
				material.blending = THREE.NoBlending;

				var geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
				var planeMesh= new THREE.Mesh( geometry, material );

				planeMesh.position.x = 0;
				planeMesh.position.y = 0;
				sliderObj.scale.multiplyScalar(1 / 200);

				//sliderObj.position = planeMesh.position;
				sliderObj.position.x = -2;
				sliderObj.position.y = -2;
				sliderObj.position.z = 0.1;
				sliderObj.quaternion = planeMesh.quaternion;

				//scene.add(planeMesh);

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
					setMap: function(event) {
						loadMap(event._event);
					}
				};

				var dispatch = function(event) {
					(eventHandlers[event.type] || function() { })(event);
				};

				$scope.setMap = function(map) {
					facerace.setMap(map);
					$scope.showMaps = false;
				};

				$scope.$watch('showMaps', function(newValue) {
					controls.enabled = !newValue;
				});

				var createWatchCollectionFunction = function(obj, config) {
					var newAction = config.newAction,
						removeAction = config.removeAction,
						updateAction = config.updateAction;

					return function(newValue) {
						console.log(arguments);	
						var currentKeys = _.keys(newValue),
							oldKeys = _.keys(obj),
							newKeys = _.difference(currentKeys, oldKeys),
							removableKeys = _.difference(oldKeys, currentKeys);

						_.each(newKeys, newAction);
						_.each(removableKeys, removeAction);

						var index = 0;
						_.each(obj, function(o) {
							updateAction(o, index++);
						});
					};
				};

				var livePlayers = {};
				$scope.$watchCollection('players', (function() {
					// http://danpearcymaths.wordpress.com/2012/09/30/infinity-programming-in-geogebra-and-failing-miserably/
					var p = function(a) { math.floor(math.sqrt(math.add(math.multiply(4, a), 1))); };
					var q = function(p, a) { math.subtract(a, math.floor(math.divide(math.square(p), 4))); };
					var parser = math.parser();

					return createWatchCollectionFunction(livePlayers, {
						newAction: function(key) {
							var width = 1,
								height = 1,
								material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide}),
								mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 1, 1), material),
								player = {
									data: $scope.players[key],
									targetQuaternion: new THREE.Quaternion(),
									mesh: mesh,
									material: material
								};

							scene.add(mesh);

							livePlayers[key] = player;
						},
						removeAction: function(key) {
							var player = livePlayers[key];
							scene.remove(player.mesh);
							delete livePlayers[key];
						},
						updateAction: function(player, index) {
							parser.eval('a = ' + index);
							parser.eval('p = floor(sqrt(4 * a + 1))');
							parser.eval('q = a - floor(p^2 / 4)');
							
							var point = parser.eval('q * i^p + (floor((p + 2) / 4) - floor((p + 1) / 4) * i) * i^(p - 1)');

							var mesh = player.mesh;
							mesh.position.y = point.re;
							mesh.position.x = point.im;
						}
					});
				})());

				var liveSources = {};
				$scope.$watchCollection('sources', (function() {
					// http://danpearcymaths.wordpress.com/2012/09/30/infinity-programming-in-geogebra-and-failing-miserably/
					var p = function(a) { math.floor(math.sqrt(math.add(math.multiply(4, a), 1))); };
					var q = function(p, a) { math.subtract(a, math.floor(math.divide(math.square(p), 4))); };
					var parser = math.parser();

					return createWatchCollectionFunction(liveSources, {
						newAction: function(key) {
							console.log('source', key)
							var videoSource = $scope.sources[key],
								video = videoSource.element,
								width = 1,
								height = 1,
								texture = new THREE.Texture(video), 
								material = new THREE.ShaderMaterial({
									fragmentShader: document.getElementById('plane-fragment-shader' + swirl).textContent,
									vertexShader: document.getElementById('plane-vertex-shader' + swirl).textContent,
									uniforms: {
										texture: {type: 't', value: texture},
										width: {type: 'f', value: width},
										height: {type: 'f', value: height},
										radius: {type: 'f', value: 2},
										angle: {type: 'f', value: 0.8},
										center: {type: 'v2', value: new THREE.Vector2(width / 2, height / 2)},
										time: {type: 'f', value: 1.0}
									},
									side: THREE.DoubleSide
								}),
								mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 1, 1), material);

							texture.lastUpdate = 0;

							scene.add(mesh);

							videoSource.mesh = mesh;
							videoSource.texture = texture;
							videoSource.material = material;
							liveSources[key] = videoSource;

							if (videoSource.socketID == rtc._me) {
								facerace.video(videoSource.socketID);
							}
						},
						removeAction: function(key) {
							var videoSource = liveSources[key];
							scene.remove(videoSource.mesh);
							delete liveSources[key];
						},
						updateAction: function(source, index) {
							parser.eval('a = ' + index);
							parser.eval('p = floor(sqrt(4 * a + 1))');
							parser.eval('q = a - floor(p^2 / 4)');
							
							var point = parser.eval('q * i^p + (floor((p + 2) / 4) - floor((p + 1) / 4) * i) * i^(p - 1)');

							var mesh = source.mesh;
							mesh.position.y = point.re;
							mesh.position.x = point.im;
						}
					});
				})());

				$scope.updateScene = (function() {
					var maxfps = 5,
						lastFrame = new Date().getTime();

					var waitingForState = function(transport, now, dt) {
						if (transport.state._yourID != null) updateFn = haveState;
					};

					var haveState = function(transport, now, dt) {
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

						$scope.orientation = orientation();
						facerace.orientation($scope.orientation);

						loadMap(transport.state.map); // get rid of this!
						$scope.$apply();

						_.each(transport.events.processedEvents, dispatch);

						_.each(livePlayers, function(player) {
							var data = player.data,
								q = data.orientation.quaternion,
								tq = player.targetQuaternion,
								mesh = player.mesh,
								mq = mesh.quaternion;

							tq.set(q[0], q[1], q[2], q[3]);
							mq.slerp(tq, 0.33);
						});
					};

					var updateFn = waitingForState;	

					return function () {
						var now = new Date().getTime(),
							dt = now - lastFrame;

						var transport = facerace();

						updateFn(transport, now, dt);

						lastFrame = now;
					};
				})();
			});
		}]
	};
}];