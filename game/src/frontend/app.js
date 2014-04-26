var angular = require('angular');

module.exports = angular.module('facerace', ['angulartics', 'angulartics.google.analytics'])

	.directive('facerace', 	require('./directive'))

	.directive('hud', 		require('./hud/directive'))
	.directive('badge', 	require('./hud/badge/directive'))
	.directive('commands',	require('./hud/commands/directive'))
	.directive('debug', 	require('./hud/debug/directive'))

	.directive('video', 	require('./inputs/video/directive'))
	
	.directive('scene', 	require('./scene/directive'))
	
	.directive('animationCycler', 		require('./util/animationCycler/directive'))
	.directive('geneticallyAnimated', 	require('./util/geneticallyAnimated/directive'))
	.directive('focusOn', 				require('./util/focusOn/directive'))
	.directive('ngEnter', 				require('./util/ngEnter/directive'))

	.factory('keys',		require('./inputs/keys/factory'))
	.factory('socket', 		require('./inputs/socket/factory'))
	.factory('orientation', require('./inputs/orientation/factory'))

	.factory('dynamicAnimation',	require('./util/dynamicAnimation/factory'))
	.factory('renderService',		require('./util/renderService/factory'))
	.factory('rtc',					require('./util/rtc/factory'))