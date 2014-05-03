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

			$scope.$watch('offeredFile', function(newValue) {
				console.log('offered file changed');
				if (newValue) {
					facerace.offer({file: newValue.name});
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
						var view = new DataView(message, 0, message.byteLength);
						for (var i = 0; i < message.byteLength; i++) {
							incoming.view.setUint8(incoming.position + i, view.getUint8(i));
						}

						incoming.position += message.byteLength;

						$scope.received = incoming.position;
						$scope.total = incoming.byteLength;
						
						console.log('received', message.byteLength, 'of', incoming.byteLength, 'at position', incoming.position);

						if (incoming.position == incoming.byteLength) {
							var blob = new Blob([incoming.buffer]);

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
							name = parts[1],
							buffer = new ArrayBuffer(byteLength),
							view = new DataView(buffer, 0, byteLength);

						console.log('Incoming file of byteLength', byteLength, '!');

						channelManager[channel] = {
							byteLength: byteLength,
							name: name,
							position: 0,
							buffer: buffer,
							view: view
						};
					}
				}
			})
		}]
	};
}];