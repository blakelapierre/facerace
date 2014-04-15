var angular = require('angular');

module.exports = function() {
	var quaternion = [0, 0, 0, 1],
		alpha = 0,
		beta = 0,
		gamma = 0,
		metrics = {};

	var orientationListener = function(event) {
		//controls.turn = event.beta - calibration[1];
		//controls.turn = event.beta / 180 * Math.PI;

		alpha = event.alpha;
		beta = event.beta;
		gamma = event.gamma;

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/eulerToQuaternion/index.htm
		// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Using_device_orientation_with_3D_transforms
		var ah = ((alpha - 180) / 2) / 180 * Math.PI, // z
			bh = (beta / 2) / 180 * Math.PI,  // x
			gh = (/*-*/gamma / 2) / 180 * Math.PI, // y
			c1 = Math.cos(gh),
			c2 = Math.cos(ah),
			c3 = Math.cos(bh),
			s1 = Math.sin(gh),
			s2 = Math.sin(ah),
			s3 = Math.sin(bh);

		// ZXY (AlphaBetaGamma) ordering
		quaternion[0] = s1 * c2 * c3 - c1 * s2 * s3;
		quaternion[1] = c1 * s2 * c3 - s1 * c2 * s3;
		quaternion[2] = c1 * c2 * s3 + s1 * s2 * c3;
		quaternion[3] = c1 * c2 * c3 + s1 * s2 * s3;

		// if ($scope.debug) {
		// 	var now = new Date().getTime(),
		// 		controlsMetrics = $scope.controlsMetrics;
		// 	controlsMetrics.alpha.append(now, event.alpha);
		// 	controlsMetrics.beta.append(now, event.beta);
		// 	controlsMetrics.gamma.append(now, event.gamma);
		// }
	};
	window.addEventListener('deviceorientation', orientationListener); // we probably want a way to remove this if/when angular kills our object

	var orientation = {
		quaternion: quaternion,
		alpha: alpha,
		beta: beta,
		gamma: gamma
	};

	return function() {
		orientation.alpha = alpha;
		orientation.beta = beta;
		orientation.gamma = gamma;
		return orientation;
	};
};