module.exports = ['dynamicAnimation', function(dynamicAnimation) {
	var applyAnimation = function(element, animation) {
		animation.keyframeAnimation.updateName();
		
		var name = animation.keyframeAnimation.original.name;
		element.css({
			webkitAnimationName: name,
			mozAnimationName: name,
			animationName: name
		});
	};

	return {
		restrict: 'A',
		link: function($scope, element, attributes) {
			var animationClass = attributes.geneticallyAnimated,
				animation = dynamicAnimation.addAnimation(animationClass),
				keyframe = animation.keyframeAnimation;

			element.addClass(animationClass);

			keyframe.setKeyframes({
				'0%': {'background-color': '#f00'},
				'50%': {'background-color': '#0f0'},
				'100%': {'background-color': '#00f'}
			});

			// element.css({
			// 	webkitAnimationName: animationClass,
			// 	webkitAnimationDuration: '3s',
			// 	webkitAnimationIterationCount: 'infinite',
			// 	webkitAnimationTimingFunction: 'linear'
			// });

			setInterval(function() {
				keyframe.setKeyframes({
					'0%': {'color': '#f00'},
					'50%': {'color': '#0f0'},
					'100%': {'color': '#00f'}
				});

				keyframe.setKeyframes({
					'0%': {'-webkit-transform': 'rotateY(0)'},
					'50%': {'-webkit-transform': 'rotateY(180deg)'},
					'100%': {'-webkit-transform': 'rotateY(360deg)'}
				});

				var timing = [0, Math.random(), Math.random(), 1];

				animation.setTimingFunction('cubic-bezier(' + timing.join(', ') + ')');

				applyAnimation(element, animation);
			}, 3000);
		}
	};
}];