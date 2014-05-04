module.exports = function() {

	return function(scene, trackName) {
		var trackData = scene._trackData || {},
			track = trackData.track;

		if (track) scene.remove(track);

		var image = new THREE.ImageUtils.loadTexture('/images/' + trackName);
		image.needsUpdate = true;

		track = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 1000), new THREE.MeshBasicMaterial({ map: image, side: THREE.DoubleSide }));
		track.rotateX(-Math.PI / 2);
		track.position.y = -0.5;

		scene.add(track);

		trackData.track = track;

		scene._trackData = trackData;
	};  
};