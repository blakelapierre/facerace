var Tweenable = require('tweenable');

module.exports = ['$rootScope', function($scope) {

  return function(scene, trackName) {

    var trackData = scene._trackData || {},
        track = trackData.track;

    if (track) scene.remove(track);
    else {
      $scope.$on('updateScene', function(e, dt, time) {
        var geometry = trackData.geometry;

        for (var i = 0; i < geometry.vertices.length; i++) {
          geometry.vertices[i].z = 5 * Math.sin(time / 1000 + i) - 7 * Math.cos(time / 250 - i);
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

    scene.add(track);

    trackData.track = track;
    trackData.geometry = geometry;

    scene._trackData = trackData;

    var camera = $scope.activeScene.camera;

    var outTween = new Tweenable(),
        inTween = new Tweenable();

    outTween.tween({
      from:   { y: 1, z: 1 },
      to:   { y: 1000, z: 1000 },
      duration: 1500,
      easing: {
        y: 'easeOutQuad',
        z: 'bounce'
      },
      start: function() {
        camera.up.set(0, 1, 0);
      },
      step: function(t) {
        camera.position.y = t.y;
        camera.position.z = t.z;
      },
      finish: function() {
        inTween.tween({
          from:   { y: 1000, z: 1000 },
          to:   { y: 500, z: 1 },
          duration: 750,
          easing: {
            y: 'easeOutQuad',
            z: 'bounce'
          },
          step: function(t) {
            camera.position.y = t.y;
            camera.position.z = t.z;
          }
        });
      }
    });
  };  
}];