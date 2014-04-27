var angular = require('angular');

module.exports = function() {
	return {
		template: require('./template.html'),
		restrict: 'E',
		link: function($scope, element, attributes) {
			element.addClass('badge-intro'); // I don't like it here, but I don't know how to do it better
		},
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

			$scope.badgeAnimations = ['expand-badge', 'flip-badge-x', 'flip-badge-y', 'flip-badge-z'];
		}]
	};
};