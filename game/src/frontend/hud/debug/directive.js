var angular = require('angular');

module.exports = function() {
	return {
		template: require('./template.html'),
		restrict: 'E',
		controller: ['$scope', 'keys', function($scope, keys) {
			$scope.keymap = keys;

			$scope.$on('keychange', function(event, key, down) {
				if (down && key == 192) $scope.showDebug = !$scope.showDebug;
			});

			$scope.$on('newState', function(event, transport) {
				$scope.lastEvent = transport.events.processedEvents.length > 0 ? transport.events.processedEvents : $scope.lastEvent;
				$scope.state = transport.state;
			});
		}]
	}	
};