var angular = require('angular');

module.exports = angular.module('facerace', [])
	.directive('facerace', 	require('./directive'))

	.directive('hud', 		require('./hud/directive'))
	.directive('badge', 	require('./hud/badge/directive'))
	.directive('commands',	require('./hud/commands/directive'))
	.directive('debug', 	require('./hud/debug/directive'))

	.directive('video', 	require('./inputs/video/directive'))
	
	.directive('scene', 	require('./scene/directive'))
	
	.directive('focusOn', 	require('./util/focusOn/directive'))
	.directive('ngEnter', 	require('./util/ngEnter/directive'))

	.factory('keys',		require('./inputs/keys/factory'))
	.factory('socket', 		require('./inputs/socket/factory'))
	.factory('orientation', require('./inputs/orientation/factory'));