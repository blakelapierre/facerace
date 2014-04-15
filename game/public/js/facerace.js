var angular = require('angular');

module.exports = angular.module('facerace', [])
	.factory('socket', require('./socketFactory'))
	.factory('socketIOdbProxy', require('./socketIOdbProxyFactory'))
	.factory('orientation', require('./orientationFactory'))
	.directive('facerace', require('./faceraceDirective'))
	.directive('scene', require('./scene/sceneDirective'))
	.directive('hud', require('./hud/hudDirective'))
	.directive('inputs', require('./inputsDirective'));