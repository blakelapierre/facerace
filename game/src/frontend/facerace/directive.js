var angular = require('angular'),
	_ = require('lodash');

module.exports = ['socket', 'keys', function(socket, keys) {
	return {
		restrict: 'E',
		template: require('./template.html'),
		link: function($scope, element, attributes) { },
		controller:  [
			'$scope', 'renderService', 'eventsManager', 'playersManager', 'sourcesManager', 'updateManager', 'facerace',
			function($scope, renderService, eventsManager, playersManager, sourcesManager, updateManager, facerace) {

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

			$scope.$watchCollection('offerFile', function(newValue) {
				if (newValue) {
					facerace.offer({file: newValue.name});
				}
			});

			var channelManager = {};
			rtc.on('data stream data', function(channel, message) {
				if ($scope.offerFile && message == $scope.offerFile.name) {
					console.log(channel, $scope.offerFile.reader);

					var chunkSize = 32 * 1024,
						result = $scope.offerFile.reader.result;

						channel.send(result.length + ';' + message);

					for (var i = 0; i < result.length; i += chunkSize) {
						channel.send(result.slice(i, Math.min(i + chunkSize, result.length)));
					}
				}
				else {
					var incoming = channelManager[channel];
					if (incoming) {					
						for (var i = 0; i < message.length; i++) {
							incoming.buffer[i + incoming.position] = message[i];
						}

						incoming.position += message.length;
						console.log('received', message.length, 'of', incoming.length, 'at position', incoming.position);

						if (incoming.position == incoming.length) {
							var blob = new Blob([incoming.buffer]);

							var a = document.createElement('a');
							a.href = window.URL.createObjectURL(blob);
							a.download = incoming.name;
							a.click();
						}
					}
					else {
						var parts = message.toString().split(';'),
							length = parseInt(parts[0]),
							name = parts[1];

						console.log('Incoming file of length', length, '!');

						channelManager[channel] = {
							length: length,
							name: name,
							position: 0,
							buffer: new ArrayBuffer(length)
						};
					}
				}
			})
		}]
	};
}];