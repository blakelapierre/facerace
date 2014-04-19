var angular = require('angular');

module.exports = function HudDirective() {
	return {
		template: require('./hudTemplate.html'),
		restrict: 'E',
		link: function($scope, element, attributes) {
		
		},
		controller: ['$scope', function($scope) {
			$scope.$on('newState', function(event, transport) {
				$scope.maps = transport.state.maps;
			});
		}]
	}	
};