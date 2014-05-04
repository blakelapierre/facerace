var angular = require('angular'),
	_ = require('lodash');

module.exports = ['socket', 'keyboard', function(socket, keyboard) {
	return {
		restrict: 'E',
		template: require('./template.html'),
		link: function($scope, element, attributes) { },
		controller:  [
			'$scope', '$http', 'renderService', 'eventsManager', 'playersManager', 'sourcesManager', 'updateManager', 'facerace',
			function($scope, $http, renderService, eventsManager, playersManager, sourcesManager, updateManager, facerace) {

			$scope.$on('sceneReady', function(e, s) {
				if (s.name == 'main') {
					var scene = s.scene,
						cssScene = s.cssScene,
						camera = s.camera,
						controls = s.controls;


					var dispatch = eventsManager.setScene(scene, cssScene),
						livePlayers = playersManager.setScene(scene, cssScene),
						liveSources = sourcesManager.setScene(scene, cssScene),
						liveTransport = updateManager.setScene(scene, cssScene, camera);

					renderService.start();
				}
			});

			$scope.$watch('offeredFile', function(offeredFile) {
				console.log('offered file changed', offeredFile);
				if (offeredFile) {
					facerace.offer({file: offeredFile.name});

					if (offeredFile.type.indexOf('image/') == 0) {
						var fd = new FormData();

						fd.append('file', offeredFile);

						$http.post('/images', fd, {
							headers: { 'Content-Type': undefined },
							transformRequest: angular.identity
						});
					}
				}
			});



			var channelManager = {};
			rtc.on('data stream data', function(channel, message) {
				if ($scope.offeredFile && message == $scope.offeredFile.name) {
					console.log(channel, $scope.offeredFile);

					rtc.sendFile(channel, $scope.offeredFile);
				}
				else {
					var incoming = channelManager[channel];
					if (incoming) {
						var now = new Date().getTime();

						incoming.buffers.push(message);

						incoming.position += message.byteLength;

						$scope.received = incoming.position;
						$scope.total = incoming.byteLength;
						$scope.downSpeed = incoming.position / (now - incoming.start) / 1000;
			
						if (incoming.position == incoming.byteLength) {
							var blob = new Blob(incoming.buffers);

							var a = document.createElement('a');
							a.href = window.URL.createObjectURL(blob);
							//a.href = window.URL.createObjectURL(incoming.buffer.toString());
							a.download = incoming.name;
							a.click();
						}
					}
					else {
						var parts = message.toString().split(';'),
							byteLength = parseInt(parts[0]),
							name = parts[1];

						console.log('Incoming file of byteLength', byteLength, '!');

						channelManager[channel] = {
							byteLength: byteLength,
							name: name,
							position: 0,
							buffers: [],
							start: new Date().getTime()
						};
					}
				}
			})
		}]
	};
}];