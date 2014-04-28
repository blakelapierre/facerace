var facerace = require('../../sim/facerace');

module.exports = ['$rootScope', 'socket', function($scope, socket) {
	facerace = facerace(false, rtc, socket);

	return facerace;
}];