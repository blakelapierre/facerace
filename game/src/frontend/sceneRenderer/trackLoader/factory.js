module.exports = ['$rootScope', function($scope) {

	return function(scene, trackName) {
		var trackData = scene._trackData || {},
			track = trackData.track;

		if (track) scene.remove(track);
		else {
			$scope.$on('updateScene', function(e, dt, time) {
				var geometry = trackData.geometry;

				for (var i = 0; i < geometry.vertices.length; i++) {
					geometry.vertices[i].z = 5 * Math.sin(time / 1000 + i) + 7 * Math.cos(time / 500 + i);
				}

				geometry.verticesNeedUpdate = true;
			});
		}

		var image = new THREE.ImageUtils.loadTexture('/images/' + trackName);
		image.needsUpdate = true;

		var geometry = new THREE.PlaneGeometry(1000, 1000, 100, 100),
			material = new THREE.MeshBasicMaterial({ map: image, side: THREE.DoubleSide });

		geometry.dynamic = true;

		track = new THREE.Mesh(geometry, material);
		track.rotateX(-Math.PI / 2);
		track.position.y = -0.5;

		for (var i = 0; i < geometry.vertices.length; i++) {
			geometry.vertices[i].z = 5 * Math.sin(i);
		}

		scene.add(track);

		trackData.track = track;
		trackData.geometry = geometry;

		scene._trackData = trackData;
	};  
}];