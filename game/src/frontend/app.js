var angular = require('angular');

module.exports = angular.module('facerace', [])
	.factory('socket', require('./inputs/socket/factory'))
	.factory('orientation', require('./inputs/orientation/factory'))
	.directive('focusOn', require('./util/focusOn/directive'))
	.directive('ngEnter', require('./util/ngEnter/directive'))
	.directive('facerace', require('./directive'))
	.directive('scene', require('./scene/directive'))
	.directive('hud', require('./hud/directive'))
	.directive('badge', require('./hud/badge/directive'))
	.directive('debug', require('./hud/debug/directive'))
	.directive('inputs', require('./inputs/video/directive'));