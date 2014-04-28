var angular = require('angular');

module.exports = angular.module('facerace', ['angulartics', 'angulartics.google.analytics'])

	.directive('facerace', 	require('./facerace/directive'))

	.directive('hud', 		require('./hud/directive'))
	.directive('badge', 	require('./hud/badge/directive'))
	.directive('commands',	require('./hud/commands/directive'))
	.directive('debug', 	require('./hud/debug/directive'))

	.directive('video', 	require('./inputs/video/directive'))
	
	.directive('scene', 	require('./scene/directive'))
	
	.directive('animationCycler', 		require('./util/animation/animationCycler/directive'))
	.directive('geneticallyAnimated', 	require('./util/animation/geneticallyAnimated/directive'))
	.directive('focusOn', 				require('./util/focusOn/directive'))
	.directive('jsonRenderer',			require('./util/jsonRenderer/directive'))
	.directive('ngEnter', 				require('./util/ngEnter/directive'))

	.factory('facerace',	require('./facerace/factory'))

	.factory('keys',		require('./inputs/keys/factory'))
	.factory('socket', 		require('./inputs/socket/factory'))
	.factory('orientation', require('./inputs/orientation/factory'))

	.factory('mapLoader',		require('./scene/mapLoader/factory'))
	.factory('playersManager',	require('./scene/managers/players/factory'))
	.factory('sourcesManager', 	require('./scene/managers/sources/factory'))
	.factory('updateManager', 	require('./scene/managers/update/factory'))

	.factory('dynamicAnimation',	require('./util/animation/dynamicAnimation/factory'))
	.factory('recursiveDirective',	require('./util/recursiveDirective/factory'))
	.factory('renderService',		require('./util/renderService/factory'))
	.factory('rtc',					require('./util/rtc/factory'))
	.factory('scopeHelpers',		require('./util/scopeHelpers/factory'))

	.filter('json',		require('./util/filters/json/filter'))