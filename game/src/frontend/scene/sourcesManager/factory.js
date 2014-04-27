var math = require('mathjs')();

module.exports = ['$rootScope', 'scopeHelpers', function($scope, scopeHelpers) {
	var scene, cssScene;
	return {
		setScene: function(s, cs) {
			if (scene) {} // detach?

			scene = s;
			cssScene = cs;

			var addSource = function(key, source) {
				console.log('source', key)
				var videoSource = $scope.sources[key],
					video = videoSource.element,
					width = 1,
					height = 1,
					texture = new THREE.Texture(video), 
					material = new THREE.ShaderMaterial({
						fragmentShader: document.getElementById('plane-fragment-shader').textContent,
						vertexShader: document.getElementById('plane-vertex-shader').textContent,
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
			};

			// http://danpearcymaths.wordpress.com/2012/09/30/infinity-programming-in-geogebra-and-failing-miserably/
			var p = function(a) { math.floor(math.sqrt(math.add(math.multiply(4, a), 1))); };
			var q = function(p, a) { math.subtract(a, math.floor(math.divide(math.square(p), 4))); };
			var parser = math.parser();

			var liveSources = {};
			$scope.$watchCollection('sources', scopeHelpers.createWatchCollectionFunction($scope, liveSources, {
				newAction: addSource,
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
			}));

			return liveSources;
		}
	};
}];