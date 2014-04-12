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
				cssFactor = 1,
				cssCamera = new THREE.PerspectiveCamera(75, width / height, 0.1 * cssFactor, 1000 * cssFactor),
				// camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 ), // play around with this some more
				stats = new Stats(),
				controls = new THREE.TrackballControls(camera);

			element.prepend(stats.domElement);
			element.prepend(cssRenderer.domElement);
			cssRenderer.domElement.appendChild(webGLRenderer.domElement);
			
			$scope.scene = {
				scene: scene,
				cssScene: cssScene,
				webGLRenderer: webGLRenderer,
				cssRenderer: cssRenderer,
				camera: camera,
				cssCamera: cssCamera,
				controls: controls,
				stats: stats
			};


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

			$scope.$emit('sceneReady');
		}
	};
}];