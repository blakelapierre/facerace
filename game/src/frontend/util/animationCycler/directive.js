module.exports = function() {
	return {
		restrict: 'A',
		scope: {
			animationCycler: '=animationCycler'
		},
		link: function($scope, element, attributes) {
			$scope.$watchCollection('animationCycler', function(newValue) {
				
			});

			$scope.$on('sceneUpdate', function() {

			});
		}
	};
};