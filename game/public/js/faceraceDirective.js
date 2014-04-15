var angular = require('angular'),
	_ = require('lodash'),
	math = require('mathjs')(),
	facerace = require('./facerace/facerace');

module.exports = ['socket', function FaceraceDirective (socket) {
	return {
		restrict: 'E',
		template: require('./faceraceTemplate.html'),
		link: function($scope, element, attributes) { },
		controller:  ['$scope', function($scope) {
			$scope.$on('sceneReady', function(e, s) {
				console.log('scene', s);

				var scene = s.scene,
					cssScene = s.cssScene,
					camera = s.camera,
					controls = s.controls,
					swirl = window.location.hash.indexOf('-swirl') > -1 ? '-swirl' : '';

				var skybox;

				var loadMap = function(map) {
					var urls = _.map(['px', 'nx', 'py', 'ny', 'pz', 'nz'], function(face) {
						return '/images/' + map + '/cubemap-' + face + '.png';
		            });

		            var cubemap = THREE.ImageUtils.loadTextureCube(urls);

			        var shader = THREE.ShaderLib[ "cube" ];
			        shader.uniforms[ "tCube" ].value = cubemap;

			        var material = new THREE.ShaderMaterial( {
			          fragmentShader: shader.fragmentShader,
			          vertexShader: shader.vertexShader,
			          uniforms: shader.uniforms,
			          depthWrite: false,
			          side: THREE.DoubleSide
			        });

			        if (skybox) scene.remove(skybox);
			        skybox = new THREE.Mesh( new THREE.CubeGeometry( 10000, 10000, 10000 ), material );
			        scene.add(skybox);
				};
	            

				$scope.liveSources = {};
				$scope.$watchCollection('sources', function(newValue, ALSONEWVALUEಠ_ಠ, $scope) {
					var liveSources = $scope.liveSources,
						currentKeys = _.keys(newValue),
						oldKeys = _.keys(liveSources),
						newKeys = _.difference(currentKeys, oldKeys),
						removableKeys = _.difference(oldKeys, currentKeys);


					_.each(newKeys, function(newKey) {
						var videoSource = newValue[newKey],
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
							
						// texture.anisotropy = webGLRenderer.getMaxAnisotropy();
						// texture.format = THREE.RGBFormat;
						// texture.generateMipmaps = false;

						texture.lastUpdate = 0;

						scene.add(mesh);

						videoSource.mesh = mesh;
						videoSource.texture = texture;
						videoSource.material = material;
						liveSources[newKey] = videoSource;

						if (videoSource.socketID == rtc._me) {
							facerace.video(videoSource.socketID);
							videoSource.mesh.add(camera);
						}
					});

					_.each(removableKeys, function(removableKey) {
						var videoSource = liveSources[removableKey];
						scene.remove(videoSource.mesh);
						delete liveSources[removableKey];
					});



					// http://danpearcymaths.wordpress.com/2012/09/30/infinity-programming-in-geogebra-and-failing-miserably/
					// p = floor(sqrt(4 * a + 1))
					// q = a - floor(p^(2) / 4)
					// q * ί^(p) + (floor((p + 2) / 4) - floor((p + 1) / 4) * ί) * ί^(p - 1)
					var p = function(a) { math.floor(math.sqrt(math.add(math.multiply(4, a), 1))); };
					var q = function(p, a) { math.subtract(a, math.floor(math.divide(math.square(p), 4))); };
					var i = 0,
						parser = math.parser();

					_.each(liveSources, function(videoSource) {
						parser.eval('a = ' + i);
						parser.eval('p = floor(sqrt(4 * a + 1))');
						parser.eval('q = a - floor(p^2 / 4)');
						
						var point = parser.eval('q * i^p + (floor((p + 2) / 4) - floor((p + 1) / 4) * i) * i^(p - 1)');

						var mesh = videoSource.mesh;
						mesh.position.y = point.re;
						mesh.position.x = point.im;
						i++;
					});
				}, true);

				var jsonSeperator = '|\u00b7\u00b7';

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
				})

				var maxfps = 24,
					lastFrame = new Date().getTime();
				$scope.updateScene = function () {
					var now = new Date().getTime(),
						dt = now - lastFrame;

					var result = facerace();

					var source = $scope.liveSources['local'];
					if (source && source.mesh) camera.lookAt(source.mesh.position);

					_.each($scope.liveSources, function(source, id) {
						var element = source.element;
						if (element.readyState == element.HAVE_ENOUGH_DATA &&
							now - source.texture.lastUpdate > (1000 / maxfps) ) {
							source.texture.needsUpdate = true;
							source.texture.lastUpdate = now;
						}
						source.material.uniforms.time.value += 1;
					});

					
					$scope.lastEvent = result.events.processedEvents.length > 0 ? JSON.stringify(result.events.processedEvents, null, jsonSeperator) : $scope.lastEvent;
					$scope.state = JSON.stringify(result.state, null, jsonSeperator);
					$scope.maps = result.state.maps;
					$scope.$apply();

					_.each(result.events.processedEvents, dispatch);

					lastFrame = now;
				}
			});
		}]
	};
}];