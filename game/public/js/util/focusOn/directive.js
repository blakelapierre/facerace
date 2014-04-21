module.exports = function() {
	return {
		restrict: 'A',
		link: function($scope, element, attributes) {
			console.log(element);
			element = element[0];

			$scope.$watch(attributes['focusOn'], function(newValue) {
				if (newValue) setTimeout(function() { element.focus(); }, 0);
			});
		}
	};
};