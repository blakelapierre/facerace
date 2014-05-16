var angular = require('angular'),
  THREE = require('three');

module.exports = function() {
  var quaternion = [0, 0, 0, 1],
    alpha = 0,
    beta = 0,
    gamma = 0,
    windowOrientation = THREE.Math.degToRad(window.orientation || 0),
    metrics = {};


  var orientationListener = (function() {
    var screenQuaternion = new THREE.Quaternion(),
      worldHalfAngle = Math.PI / 2,
      worldQuaternion = new THREE.Quaternion(Math.sin(-worldHalfAngle), 0, 0, Math.cos(-worldHalfAngle)),
      deviceEuler = new THREE.Euler(),
      finalQuaternion = new THREE.Quaternion();

    return function(event) {
      //controls.turn = event.beta - calibration[1];
      //controls.turn = event.beta / 180 * Math.PI;

      alpha = THREE.Math.degToRad(event.alpha);
      beta = THREE.Math.degToRad(event.beta);
      gamma = THREE.Math.degToRad(event.gamma);

      deviceEuler.set(alpha, beta, -gamma, 'ZXY');

      finalQuaternion.setFromEuler(deviceEuler);

      var orientationHalfAngle = windowOrientation / 2;

      screenQuaternion.set(0, Math.sin(-orientationHalfAngle), 0, Math.cos(-orientationHalfAngle));

      //finalQuaternion.multiply(screenQuaternion);
      // finalQuaternion.multiply(worldQuaternion);

      quaternion[0] = finalQuaternion.x;
      quaternion[1] = finalQuaternion.y;
      quaternion[2] = finalQuaternion.z;
      quaternion[3] = finalQuaternion.w;

      // http://www.euclideanspace.com/maths/geometry/rotations/conversions/eulerToQuaternion/index.htm
      // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Using_device_orientation_with_3D_transforms
      // http://dev.opera.com/articles/view/w3c-device-orientation-usage/#quaternions
      // var ah = ((alpha - 180) / 2) / 180 * Math.PI, // z
      //   bh = (beta / 2) / 180 * Math.PI,  // x
      //   gh = (gamma / 2) / 180 * Math.PI, // y
      //   c1 = Math.cos(gh),
      //   c2 = Math.cos(ah),
      //   c3 = Math.cos(bh),
      //   s1 = Math.sin(gh),
      //   s2 = Math.sin(ah),
      //   s3 = Math.sin(bh);

      // // ZXY (AlphaBetaGamma) ordering
      // quaternion[0] = s1 * c2 * c3 - c1 * s2 * s3;
      // quaternion[1] = c1 * s2 * c3 - s1 * c2 * s3;
      // quaternion[2] = c1 * c2 * s3 + s1 * s2 * c3;
      // quaternion[3] = c1 * c2 * c3 + s1 * s2 * s3;

      // var orientationHalfAngle = (windowOrientation / 2) / 180 * Math.PI;

      // screenQuaternion[1] = Math.sin(-orientationHalfAngle);
      // screenQuaternion[3] = Math.cos(-orientationHalfAngle);

      // quaternionMultiply(quaternion, screenQuaternion);
      // quaternionMultiply(quaternion, worldQuaternion);

      // if ($scope.debug) {
      //   var now = new Date().getTime(),
      //     controlsMetrics = $scope.controlsMetrics;
      //   controlsMetrics.alpha.append(now, event.alpha);
      //   controlsMetrics.beta.append(now, event.beta);
      //   controlsMetrics.gamma.append(now, event.gamma);
      // }
    };
  })();
  window.addEventListener('deviceorientation', orientationListener); // we probably want a way to remove this if/when angular kills our object

  var orientationChange = function(event) {
    windowOrientation = THREE.Math.degToRad(window.orientation);
  };
  window.addEventListener('orientationchange', orientationChange);

  var orientation = {
    quaternion: quaternion,
    alpha: alpha,
    beta: beta,
    gamma: gamma,
    windowOrientation: windowOrientation
  };

  return function() {
    orientation.alpha = alpha;
    orientation.beta = beta;
    orientation.gamma = gamma;
    orientation.windowOrientation = windowOrientation;
    return orientation;
  };
};