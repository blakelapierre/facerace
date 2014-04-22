var angular = require('angular');

module.exports = function() {
	return {
		template: require('./template.html'),
		restrict: 'E',
		controller: ['$scope', '$http', function($scope, $http) {
			$scope.toggleMenu = function() {
				$scope.showMenu = !$scope.showMenu;
			};

			$scope.$watch('showMenu', function(newValue) {
				if (newValue) {
					$scope.showPlus = true;
					$scope.showAddress = false;
				}
				$scope.controlsEnabled = !newValue;
			});

			$scope.sendInvite = function() {
				$http.post('/invite/' + $scope.address, {room: window.location.hash || '#facerace'})
					.success(function() {
						$scope.showMenu = false;
						$scope.address = null;
					});

				return true;
			};
		}]
	};
};