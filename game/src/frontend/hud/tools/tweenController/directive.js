var Tweenable = require('tweenable');

module.exports = function() {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: function($scope, element, attributes) {

      $scope.$watch('tweenControlObject', function(obj) {

      });
    }
  }
};