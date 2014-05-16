var angular = require('angular'),
  THREE = require('three'),
  Stats = require('stats'),
  _ = require('lodash');

module.exports = ['scenesManager', function(scenesManager) {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: function($scope, element, attributes) {
      var width = window.innerWidth,
        height = window.innerHeight,
        webGLRenderer = new THREE.WebGLRenderer({antialias: false, alpha: true}),
        cssRenderer = new THREE.CSS3DRenderer({}),
        stats = new Stats(),
        managedScene = scenesManager.addScene('main', true, width, height),
        controls = new THREE.TrackballControls(managedScene.camera);

      controls.enabled = false;

      element.prepend(stats.domElement);
      element.prepend(cssRenderer.domElement);
      cssRenderer.domElement.appendChild(webGLRenderer.domElement);

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

        scenesManager.updateCameras(width, height);
      };
      window.addEventListener('resize', resize, false);

      $scope.$on('renderScene', function() {
        controls.update();

        var activeScene = $scope.activeScene,
          scene = activeScene.scene,
          cssScene = activeScene.cssScene,
          camera = activeScene.camera;

        webGLRenderer.render(scene, camera);
        if (cssScene) cssRenderer.render(cssScene, camera);

        stats.update();
      });
    }
  };
}];