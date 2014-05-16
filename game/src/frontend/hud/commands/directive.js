var angular = require('angular'),
    _ = require('lodash');


module.exports = ['keyboard', function(keyboard) {
  return {
    template: require('./template.html'),
    restrict: 'E',
    link: function($scope, element, attributes) {
      var createCommand = function(displayName, click) {
        return {
          displayName: displayName,
          click: click,
          class: {
            'command': true,
            'highlight': false
          }
        };
      };

      var commands = [
        createCommand('Debug Mode', function() { 
          $scope.showDebug = !$scope.showDebug;
          this.class.highlight = $scope.showDebug;
        })
      ];      

      $scope.commands = commands;

      keyboard.setMode('handlers');

      var handlers = {
        192: function(down) {
          if (down) $scope.showDebug = !$scope.showDebug;
        }
      };

      keyboard.setKeyHandlers(handlers);
    }
  };
}];