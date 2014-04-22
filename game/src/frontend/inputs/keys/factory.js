module.exports = ['$rootScope', function($scope) {
	var w = angular.element(window)
		keymap = {};

	w.bind('keydown', function(event) {
		keymap[event.which] = true;
		$scope.$broadcast('keychange', event.which, true);
	});

	w.bind('keyup', function(event) {
		keymap[event.which] = false;
		$scope.$broadcast('keychange', event.which, false);
	});

	return keymap;
}];