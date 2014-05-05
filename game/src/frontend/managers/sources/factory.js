var math = require('mathjs')();

module.exports = ['$rootScope', 'scopeHelpers', 'facerace', function($scope, scopeHelpers, facerace) {
	var scene, cssScene;
	return {
		setScene: function(s, cs) {
			if (scene) {} // detach?

			scene = s;
			cssScene = cs;

			var addSource = function(key, videoSource) {
				console.log('source', key)

				var player = _.find($scope.livePlayers, function(player) {
					console.log(player.simulationData.peerConnectionID, key);
					return player.simulationData.peerConnectionID == key;
				});
				console.log(player); 

				var video = videoSource.element,
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

				if (player) player.mesh = mesh;

				videoSource.mesh = mesh;
				videoSource.texture = texture;
				videoSource.material = material;
				liveSources[key] = videoSource;

				if (videoSource.socketID == rtc._me) {
					facerace.video(videoSource.socketID);
				}
			};

			

			var liveSources = {};
			$scope.$on('addSource', function(e, source) {
				addSource(source.socketID, source);
			});

			$scope.$on('removeSource', function(e, source) {
				var videoSource = liveSources[source.socketID];
				scene.remove(videoSource.mesh);
				delete liveSources[source.socketID];
			});

			$scope.liveSources = liveSources;
			
			return liveSources;
		}
	};
}];