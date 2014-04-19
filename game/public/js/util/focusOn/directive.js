module.exports = function() {
	return {
		restrict: 'A',
		link: function($scope, element, attributes) {
			element = element[0];

			$scope.$watch(attributes['focusOn'], function(newValue) {
				if (newValue) element.focus();
			});
		}
	};
};