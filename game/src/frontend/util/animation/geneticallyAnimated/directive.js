var Random = require('random');

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

	var collapseTransforms = function(keyframes) {
		var collapsed = {};
		for (var key in keyframes) {
			var frame = keyframes[key],
				newFrame = {};

			for (var property in frame) {
				var value = frame[property];

				switch (property) {
					case '-webkit-transform':
						var css = '';
						for (var transformName in value) {
							css += transformName + '(' + value[transformName] + ') ';
						}
						newFrame[property] = css;
						break;
					default:
						newFrame[property] = value;
						break;
				}
			}

			collapsed[key] = newFrame;
		}
		return collapsed;
	};

	var random = new Random();

	return {
		restrict: 'A',
		link: function($scope, element, attributes) {
			var animationClass = attributes.geneticallyAnimated,
				animation = dynamicAnimation.addAnimation({
					name: animationClass,
					duration: '5s'
				}),
				keyframe = animation.keyframeAnimation;

			element.addClass(animationClass);

			keyframe.setKeyframes({
				'0%': {'background-color': '#f00'},
				'50%': {'background-color': '#0f0'},
				'100%': {'background-color': '#00f'}
			});

			var yRotations = [0, 180, 360, 180, 0],
				percentStep = 100 / (yRotations.length - 1),
				keyframes = {},
				transforms = new Array(yRotations.length);

			for (var i = 0; i < yRotations.length; i++) {
				var transform = {rotateY: yRotations[i] + 'deg'};
				keyframes[(i * percentStep) + '%'] = {
					'-webkit-transform': transform
				};
				transforms[i] = transform;
			}

			var mu = [0.33, 0, 0.66, 1],
				sigma = [0.01, 0.01, 0.01, 0.01],
				timing = [0, 0, 0, 0];
			setInterval(function() {
				for (var i = 0; i < yRotations.length; i++) {
					var rotation = random.normal(yRotations[i], 10);

					transforms[i].rotateY = rotation + 'deg';
					yRotations[i] = rotation;
				}

				keyframe.setKeyframes(collapseTransforms(keyframes));

				for (var i = 0; i < mu.length; i++) {
					var newMu = random.normal(mu[i], sigma[i]);
					timing[i] = newMu;
					mu[i] = newMu;
				}

				animation.setTimingFunction('cubic-bezier(' + timing.join(', ') + ')');

				applyAnimation(element, animation);
			}, 5 * 1000);
		}
	};
}];