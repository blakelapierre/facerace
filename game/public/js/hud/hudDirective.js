var angular = require('angular');

module.exports = function HudDirective() {
	return {
		template: require('./hudTemplate.html'),
		restrict: 'E',
		link: function($scope, element, attributes) {
		
		}
	}	
};