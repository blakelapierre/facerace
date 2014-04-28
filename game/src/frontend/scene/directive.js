var angular = require('angular'),
	THREE = require('three'),
	Stats = require('stats'),
	_ = require('lodash');

module.exports = [function() {
	return {
		restrict: 'E',
		template: require('./template.html'),
		link: function($scope, element, attributes) {
			var width = window.innerWidth,
				height = window.innerHeight,

				scenes = {
					main: {

					}
				},

				scene = new THREE.Scene(),
				cssScene = new THREE.Scene(),
				webGLRenderer = new THREE.WebGLRenderer({antialias: false, alpha: true}),
				cssRenderer = new THREE.CSS3DRenderer({}),
				camera = new THREE.PerspectiveCamera(85, width / height, 0.1, 1000000),
				cssFactor = 1,
				cssCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000000),
				// camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 ), // play around with this some more
				stats = new Stats(),
				controls = new THREE.TrackballControls(camera);

			controls.enabled = false;

			element.prepend(stats.domElement);
			element.prepend(cssRenderer.domElement);
			cssRenderer.domElement.appendChild(webGLRenderer.domElement);

			camera.up.set(0, 1, 0);
			camera.position.z = 2;

			cssCamera.up = camera.up;
			cssCamera.quaternion = camera.quaternion;
			cssCamera.position = camera.position;

			scene.add(new THREE.AmbientLight(0xffffff));

			webGLRenderer._rendererName = 'webGLRenderer';
			cssRenderer._rendererName = 'cssRenderer';

			webGLRenderer._element = angular.element(webGLRenderer.domElement);
			cssRenderer._element = angular.element(cssRenderer.domElement.children[0]);

			webGLRenderer._element.addClass('renderer').addClass(name);

			angular.element(cssRenderer.domElement).addClass('renderer');

			_.each([webGLRenderer, cssRenderer], function(renderer) {
				console.log(renderer._rendererName, renderer);
				var element = renderer._element,
					name = renderer._rendererName;
				
				renderer.setSize(width, height);

				$scope.$watch('hide_' + name, function(newValue) {
					element.css('display', newValue ? 'none' : 'block');
				});
			});

			$scope.$watch('controlsEnabled', function(newValue) {
				controls.enabled = newValue;
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

			$scope.$on('renderScene', function() {
				controls.update();
				webGLRenderer.render(scene, camera);
				cssRenderer.render(cssScene, camera);
				stats.update();
			});

			$scope.$emit('sceneReady', {
				scene: scene,
				cssScene: cssScene,
				camera: camera,
				cssCamera: cssCamera,
				controls: controls
			});
		}
	};
}];