var angular = require('angular'),
	FileReaderJS = require('filereader');

module.exports = function() {
	return {
		template: require('./template.html'),
		restrict: 'E',
		link: function($scope, element, attributes) {
			$scope.shareFile = function() {
				var input = document.createElement('input');
				input.type = 'file';

				$scope.offerFile = {};

				angular.element(input).bind('change', function(e) {
					$scope.offeredFile = e.target.files[0];
				});

				input.click();
				
				$scope.showMenu = false;
			};
		},
		controller: ['$scope', '$http', function($scope, $http) {
			$scope.toggleMenu = function() {
				$scope.showMenu = !$scope.showMenu;
			};

			$scope.$watch('showMenu', function(newValue) {
				if (newValue) {
					$scope.showPlusFile = true;
					$scope.showPlusPerson = true;
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