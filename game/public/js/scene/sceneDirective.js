var angular = require('angular'),
	THREE = require('three'),
	Stats = require('stats'),
	_ = require('lodash');

module.exports = [function SceneDirective() {
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
				cssFactor = 100,
				cssCamera = new THREE.PerspectiveCamera(75, width / height, 0.1 * cssFactor, 1000 * cssFactor),
				// camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 ), // play around with this some more
				stats = new Stats(),
				controls = new THREE.TrackballControls(camera);

			element.prepend(stats.domElement);
			element.prepend(cssRenderer.domElement);
			element.prepend(webGLRenderer.domElement);


			camera.up.set(0, 1, 0);
			camera.position.z = 2;

			cssCamera.up = camera.up;
			cssCamera.quaternion = camera.quaternion;
			cssCamera.position = camera.position;

			scene.add(new THREE.AmbientLight(0xffffff));

			webGLRenderer._rendererName = 'webGLRenderer';
			cssRenderer._rendererName = 'cssRenderer';

			_.each([webGLRenderer, cssRenderer], function(renderer) {
				var element = angular.element(renderer.domElement)
					name = renderer._rendererName;
				
				renderer.setSize(width, height);

				element.addClass('renderer').addClass(name);

				$scope.$watch('hide_' + name, function(newValue) {
					element.css('display', newValue ? 'none' : 'block');
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

			$scope.$emit('sceneReady', {
				scene: scene,
				cssScene: cssScene,
				camera: camera,
				cssCamera: cssCamera
			});

			var render = function() {
				window.requestAnimationFrame(render);

				$scope.updateScene();

				controls.update();
				webGLRenderer.render(scene, camera);
				cssRenderer.render(cssScene, camera);
				stats.update();
			};
			window.requestAnimationFrame(render);
		}
	};
}];