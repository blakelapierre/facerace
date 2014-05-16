module.exports = ['$rootScope', function($scope) {
  var scenes = {},
    sceneCount = 0;

  $scope.scenes = scenes;

  var setActiveScene = function(name) {
    var scene = scenes[name];

    $scope.activeScene = scene;

    $scope.$emit('sceneReady', scene);
  };

  return {
    addScene: function(name, includeCssScene, width, height) {
      var camera = new THREE.PerspectiveCamera(85, width / height, 0.1, 1000000),
        cssCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000000);

      camera.up.set(0, 1, 0);
      camera.position.z = 2;

      cssCamera.up = camera.up;
      cssCamera.quaternion = camera.quaternion;
      cssCamera.position = camera.position;

      var scene = {
        name: name,
        scene: new THREE.Scene(),
        cssScene: includeCssScene ? new THREE.Scene() : null,
        camera: camera,
        cssCamera: cssCamera
      };

      scenes[name] = scene;
      sceneCount++;

      if (sceneCount == 1) setActiveScene(name);

      return scene;
    },
    removeScene: function(name) {
      delete scenes[name]; // do we need to do more than this? hopefully not
      sceneCount--;
    },
    setActiveScene: setActiveScene,
    updateCameras: function(width, height) {
      _.each(scenes, function(scene) {
        var camera = scene.camera,
          cssCamera = scene.cssCamera;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        cssCamera.aspect = width / height;
        cssCamera.updateProjectionMatrix();
      });
    }
  };
}];