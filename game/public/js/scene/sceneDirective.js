var angular = require('angular'),
	THREE = require('three'),
	Stats = require('stats'),
	_ = require('lodash'),
	mathjs = require('mathjs'),
	math = mathjs(),
	facerace = require('./../facerace/facerace');

module.exports = ['socket', function SceneDirective(socket) {
	return {
		restrict: 'E',
		template: require('./sceneTemplate.html'),
		link: function($scope, element, attributes) {
			var width = window.innerWidth,
				height = window.innerHeight,
				scene = new THREE.Scene(),
				cssScene = new THREE.Scene(),
				webGLRenderer = new THREE.WebGLRenderer({antialias: false}),
				cssRenderer = new THREE.CSS3DRenderer({}),
				camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000),
				cssFactor = 1,
				cssCamera = new THREE.PerspectiveCamera(75, width / height, 0.1 * cssFactor, 1000 * cssFactor),
				// camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 ), // play around with this some more
				stats = new Stats(),
				controls = new THREE.TrackballControls(camera),
				swirl = window.location.hash.indexOf('-swirl') > -1 ? '-swirl' : '';

			element.prepend(stats.domElement);
			element.prepend(cssRenderer.domElement);
			cssRenderer.domElement.appendChild(webGLRenderer.domElement);

			$scope.scene = scene;
			$scope.webGLRenderer = webGLRenderer;
			$scope.cssRenderer = cssRenderer;


			camera.up.set(0, 1, 0);
			camera.position.z = 2;

			cssCamera.up = camera.up;
			cssCamera.position = camera.position;

			scene.add(new THREE.AmbientLight(0xffffff));

			webGLRenderer.setSize(width, height);
			cssRenderer.setSize(width, height);

			_.each([webGLRenderer, cssRenderer], function(renderer) {
				angular.element(renderer.domElement).css({
					position: 'absolute',
					top: '0px',
					left: '0px',
					width: '100%',
					height: '100%',
					overflow: 'hidden'
				});
			});

			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';

			var resize = function(e) {
				var height = e.target.innerHeight,
					width = e.target.innerWidth;
					
				webGLRenderer.setSize(width, height);
				cssRenderer.setSize(width, height);
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				cssCamera.aspect = width / height;
				cssCamera.updateProjectionMatrix();
			};
			window.addEventListener('resize', resize, false);

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
		}
	};
}];