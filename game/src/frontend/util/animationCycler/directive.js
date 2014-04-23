module.exports = function() {
	return {
		restrict: 'A',
		scope: {
			animationSet: '=animationCycler'
		},
		link: function($scope, element, attributes) {
			var animationSet = attributes.animationCycler || 'defaultAnimationSet';

			$scope.defaultAnimationSet = [];

			$scope.$watchCollection(animationSet, function(newValue) {
				console.log('watch', arguments);
			});
		}
	};
};