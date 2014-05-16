var _ = require('lodash');

module.exports = ['recursiveDirective', function(recursiveDirective) {
  function getType(obj) {
    if (obj == null) return 'null'
      
    var type = typeof obj;

    switch (type) {
      case 'object':
        if (_.isArray(obj)) return 'array';
      case 'boolean':
      case 'string':
      case 'number':
      case 'array':
        return type;
        break;
    }

    return 'unknown';
  };

  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: {obj: '=', parent: '=', key: "="},
    link: function($scope, element, attributes) {
    },
    controller: function($scope) {
      $scope._ = _; // Used by template

      $scope.showValue = true;

      $scope.toggleKey = function(key) {
        if ($scope.type === 'object' || $scope.type === 'array') $scope.showValue = !$scope.showValue;
      };

      $scope.$watch('obj', function(obj) {
        $scope.type = getType(obj);
        if ($scope.type === 'object' || $scope.type === 'array') $scope.showValue = true;
      });
    },
    compile: function(element) {
      return recursiveDirective.compile(element);
    }
  };
}];