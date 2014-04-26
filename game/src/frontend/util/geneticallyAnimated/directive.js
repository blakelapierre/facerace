
module.exports = ['dynamicAnimation', function(dynamicAnimation) {
	return {
		restrict: 'A',
		link: function($scope, element, attributes) {
			var animationClass = attributes.geneticallyAnimated,
				animation = dynamicAnimation.addAnimation(animationClass),
				keyframe = animation.keyframeAnimation;

			keyframe.setKeyframes({
				'0%': {'background-color': '#f00'},
				'50%': {'background-color': '#0f0'},
				'100%': {'background-color': '#00f'}
			});

			element.css({
				webkitAnimationName: animationClass,
				webkitAnimationDuration: '5s',
				webkitAnimationIterationCount: 'infinite',
				webkitAnimationTimingFunction: 'linear'
			});

			setTimeout(function() {
				keyframe.setKeyframes({
					'0%': {'color': '#f00'},
					'50%': {'color': '#0f0'},
					'100%': {'color': '#00f'}
				});

				element.css({
					webkitAnimationName: keyframe.updateName()
				});
			}, 1000);
		}
	};
}];