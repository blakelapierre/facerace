var angular = require('angular');

module.exports = function() {
	return {
		template: require('./template.html'),
		restrict: 'E',
		controller: ['$scope', function($scope) {
			
		}]
	}
};