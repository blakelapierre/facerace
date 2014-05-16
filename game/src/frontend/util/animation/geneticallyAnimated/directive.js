var Random = require('Random');

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
        '0%': {'color': '#f00'},
        '50%': {'color': '#0f0'},
        '100%': {'color': '#00f'}
      });
      applyAnimation(element, animation);

      var yRotations = [0, 180, 360, 180, 0],
        xRotations = [0, 180, 360, 180, 0],
        zRotations = [0, 180, 360, 180, 0],
        percentStep = 100 / (yRotations.length - 1),
        keyframes = {},
        transforms = new Array(yRotations.length);

      for (var i = 0; i < yRotations.length; i++) {
        var transform = {
          rotateY: yRotations[i] + 'deg',
          rotateX: xRotations[i] + 'deg',
          rotateZ: zRotations[i] + 'deg'
        };
        keyframes[(i * percentStep) + '%'] = {
          '-webkit-transform': transform
        };
        transforms[i] = transform;
      }

      var mu = [0.33, 0, 0.66, 1],
        sigma = [0.01, 0.01, 0.01, 0.01],
        timing = [0, 0, 0, 0];
      setInterval(function() {
        var t0 = transforms[0],
          tl = transforms[transforms.length - 1];

        t0.rotateY = tl.rotateY;
        t0.rotateX = tl.rotateX;
        t0.rotateZ = tl.rotateZ;

        for (var i = 1; i < yRotations.length; i++) {
          var yRotation = random.normal(yRotations[i], 10),
            xRotation = random.normal(xRotations[i], 10),
            zRotation = random.normal(zRotations[i], 10);

          transforms[i].rotateY = yRotation + 'deg';
          transforms[i].rotateX = xRotation + 'deg';
          transforms[i].rotateZ = zRotation + 'deg';

          yRotations[i] = yRotation;
          xRotations[i] = xRotation;
          zRotations[i] = zRotation;
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