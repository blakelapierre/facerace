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
			$scope.$on('sceneReady', function() {
				console.log('scene', $scope.scene);

				var s = $scope.scene,
					scene = s.scene,
					cssScene = s.cssScene,
					webGLRenderer = s.webGLRenderer,
					cssRenderer = s.cssRenderer,
					camera = s.camera,
					cssCamera = s.cssCamera,
					controls = s.controls,
					stats = s.stats,
					swirl = window.location.hash.indexOf('-swirl') > -1 ? '-swirl' : '';

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

				var material = new THREE.MeshBasicMaterial({ wireframe: true });

				material.color.set('#fdd');
				material.opacity = 50;
				material.blending = THREE.NoBlending;

				var geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
				var planeMesh= new THREE.Mesh( geometry, material );

				planeMesh.position.x = -1;
				planeMesh.position.y = 0;
				sliderObj.scale.multiplyScalar(1 / 63.5);

				sliderObj.position = planeMesh.position;
				sliderObj.quaternion = planeMesh.quaternion;

				scene.add(planeMesh);

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
					}
				};

				var dispatch = function(event) {
					(eventHandlers[event.type] || function() { })(event);
				};

				var maxfps = 24,
					lastFrame = new Date().getTime();
				var render = function() {
					window.requestAnimationFrame(render);

					var now = new Date().getTime(),
						dt = now - lastFrame;

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

					camera.rotateZ(Math.PI * (1 / (60 * 4)));

					var result = facerace();
					$scope.lastEvent = result.events.processedEvents.length > 0 ? JSON.stringify(result.events.processedEvents, null, jsonSeperator) : $scope.lastEvent;
					$scope.state = JSON.stringify(result.state, null, jsonSeperator);
					$scope.$apply();

					_.each(result.events.processedEvents, dispatch);

					controls.update();
					webGLRenderer.render(scene, camera);
					cssRenderer.render(cssScene, cssCamera);
					stats.update();

					lastFrame = now;
				};
				window.requestAnimationFrame(render);
			});
		}]
	};
}];