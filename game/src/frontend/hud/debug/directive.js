var angular = require('angular');

module.exports = function() {
  return {
    template: require('./template.html'),
    restrict: 'E',
    controller: ['$scope', 'keyboard', 'facerace', function($scope, keyboard, facerace) {
      $scope.keyboard = keyboard();

      $scope.setMap = function(map) {
        facerace.setMap(map);
        $scope.showMaps = false;
      };

      $scope.toggleMode = function() {
        $scope.mode = $scope.mode == 'quake' ? '' : 'quake';
        facerace.mode($scope.mode);
      };

      $scope.toggleMaps = function() {
        $scope.showMaps = !$scope.showMaps;
        $scope.controlsEnabled = !$scope.showMaps;
      };

      $scope.$on('keychange', function(event, key, down) {
        if (down && key == 192) $scope.showDebug = !$scope.showDebug;
      });

      $scope.$on('newState', function(event, transport) {
        $scope.lastEvent = transport.events.processedEvents.length > 0 ? transport.events.processedEvents : $scope.lastEvent;
        $scope.state = transport.state;

        $scope.column1Objs = [$scope.state];
        $scope.column3Objs = [$scope.lastEvent];
      });

      $scope.column2Objs = [$scope.webrtc];
    }]
  };
};