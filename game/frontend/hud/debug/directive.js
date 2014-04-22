var angular = require('angular');

module.exports = function() {
	var jsonSeperator = '|\u00b7\u00b7';

	return {
		template: require('./template.html'),
		restrict: 'E',
		controller: ['$scope', function($scope) {
			$scope.$on('newState', function(event, transport) {
				$scope.lastEvent = transport.events.processedEvents.length > 0 ? JSON.stringify(transport.events.processedEvents, null, jsonSeperator) : $scope.lastEvent;
				$scope.state = JSON.stringify(transport.state, null, jsonSeperator);
			});
		}]
	}	
};