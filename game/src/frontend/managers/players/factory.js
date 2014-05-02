var math = require('mathjs')(),
	Player = require('./playerObject/player');

module.exports = ['$rootScope', 'scopeHelpers', function($scope, scopeHelpers) {
	var scene, cssScene;

	var livePlayers = {};

	return {
		setScene: function(s, cs) {
			if (scene) {} // detach?

			scene = s;
			cssScene = cs;

			var addPlayer = function(key, player) {
				var width = 1,
					height = 1,
					material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide}),
					mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 1, 1), material),
					player = new Player({
						data: $scope.players[key],
						targetQuaternion: new THREE.Quaternion(),
						mesh: mesh,
						material: material
					});

				//scene.add(mesh);
				mesh.visible = false;

				var teaser = document.createElement('div');
				var teaser = document.createElement('slider');
				teaser.type = 'range'
				// teaser.className = 'teaser';
				// teaser.innerText = 'turn your camera on!';

				var teaserObj = new THREE.CSS3DObject(teaser);
				cssScene.add(teaserObj);

				var material = new THREE.MeshBasicMaterial();

				material.color.set('black');
				material.opacity = 0;
				material.blending = THREE.NoBlending;

				var geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
				var planeMesh= new THREE.Mesh( geometry, material );

				planeMesh.position.x = 0;
				planeMesh.position.y = 0;
				teaserObj.scale.multiplyScalar(1 / 200);

				//sliderObj.position = planeMesh.position;
				teaserObj.position.x = -2;
				teaserObj.position.y = -2;
				teaserObj.position.z = 0.1;
				teaserObj.quaternion = planeMesh.quaternion;

				//scene.add(planeMesh);

				livePlayers[key] = player;
			};

			// http://danpearcymaths.wordpress.com/2012/09/30/infinity-programming-in-geogebra-and-failing-miserably/
			var p = function(a) { math.floor(math.sqrt(math.add(math.multiply(4, a), 1))); };
			var q = function(p, a) { math.subtract(a, math.floor(math.divide(math.square(p), 4))); };
			var parser = math.parser();

			$scope.$watchCollection('players', scopeHelpers.createWatchCollectionFunction($scope, livePlayers, {
				newAction: addPlayer,
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
			}));

			$scope.livePlayers = livePlayers;

			return livePlayers;
		},

		setMode: function(mode) {
			_.each(livePlayers, function(player) {
				player.setMode(mode);
			});
		}
	};	
}];