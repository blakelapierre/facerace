module.exports = function() {
	return {
		restrict: 'E',
		link: function($scope, element, attributes) {
			var w = angular.element(window)
				keymap = {};

			w.bind('keydown', function(event) {
				keymap[event.which] = true;
			});

			w.bind('keyup', function(event) {
				keymap[event.which] = false;
			});

			$scope.keymap = keymap;
		}
	};
};