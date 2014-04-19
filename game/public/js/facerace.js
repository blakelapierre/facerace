var angular = require('angular');

module.exports = angular.module('facerace', [])
	.factory('socket', require('./socketFactory'))
	.factory('socketIOdbProxy', require('./socketIOdbProxyFactory'))
	.factory('orientation', require('./orientationFactory'))
	.directive('focusOn', require('./util/focusOn/directive'))
	.directive('ngEnter', require('./util/ngEnter/directive'))
	.directive('facerace', require('./faceraceDirective'))
	.directive('scene', require('./scene/sceneDirective'))
	.directive('hud', require('./hud/directive'))
	.directive('badge', require('./hud/badge/directive'))
	.directive('debug', require('./hud/debug/directive'))
	.directive('inputs', require('./inputsDirective'));