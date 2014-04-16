var angular = require('angular');

module.exports = function HudDirective() {
	var jsonSeperator = '|\u00b7\u00b7';
	
	return {
		template: require('./hudTemplate.html'),
		restrict: 'E',
		scope: true,
		link: function($scope, element, attributes) {
		
		},
		controller: ['$scope', function($scope) {
			$scope.$on('newState', function(event, transport) {
				$scope.lastEvent = transport.events.processedEvents.length > 0 ? JSON.stringify(transport.events.processedEvents, null, jsonSeperator) : $scope.lastEvent;
				$scope.state = JSON.stringify(transport.state, null, jsonSeperator);
				$scope.maps = transport.state.maps;
			});
		}]
	}	
};