var angular = require('angular');

module.exports = function() {
	return {
		template: require('./template.html'),
		restrict: 'E',
		controller: ['$scope', function($scope) {
			$scope.toggleMenu = function() {
				$scope.showMenu = !$scope.showMenu;
			};

			$scope.$watch('showMenu', function(newValue) {
				if (newValue) {
					$scope.showPlus = true;
					$scope.showAddress = false;
				}
				$scope.controlsEnabled = !newValue;
			})
		}]
	}
};