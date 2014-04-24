module.exports = function($rootScope) {
	return {
		restrict: 'A',
		scope: {
			animationCycler: '=animationCycler'
		},
		link: function($scope, element, attributes) {
			var animationIndex = 0;
			var nextClassName = function() {
				var animations = $scope.animationCycler;

				var animation = animations[(animationIndex++) % animations.length];

				animationIndex %= animations.length;
				
				return animation;
			};

			var currentAnimation = {
				endTime: 0,
				className: ''
			};
			$rootScope.$on('updateScene', function(dt, time) {
				if (currentAnimation.endTime < time) {
					element.removeClass(currentAnimation.className);

					currentAnimation.endTime = time + 5 * 1000;
					currentAnimation.className = nextClassName();

					element.addClass(currentAnimation.className);
				}
			});
		}
	};
};