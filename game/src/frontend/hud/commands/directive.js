var angular = require('angular'),
	_ = require('lodash');


module.exports = function() {
	

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
		}
	};
};