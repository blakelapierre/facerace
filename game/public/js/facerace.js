var angular = require('angular');

module.exports = angular.module('facerace', [])
	.factory('socket', require('./socketFactory'))
	.directive('facerace', require('./faceraceDirective'))
	.directive('scene', require('./scene/sceneDirective'))
	.directive('inputs', require('./inputsDirective'));