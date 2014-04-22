var angular = require('angular');

module.exports = function() {
	var jsonSeperator = '|\u00b7\u00b7';

	return {
		template: require('./template.html'),
		restrict: 'E',
		controller: ['$scope', 'keys', function($scope, keys) {
			$scope.keymap = keys;

			$scope.$on('keychange', function(event, key, down) {
				if (down && key == 192) $scope.showDebug = !$scope.showDebug;
			});

			$scope.$on('newState', function(event, transport) {
				$scope.lastEvent = transport.events.processedEvents.length > 0 ? JSON.stringify(transport.events.processedEvents, null, jsonSeperator) : $scope.lastEvent;
				$scope.state = JSON.stringify(transport.state, null, jsonSeperator);
			});
		}]
	}	
};