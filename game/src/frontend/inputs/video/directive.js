var angular = require('angular'),
	_ = require('lodash');

module.exports = ['$sce', 'rtc', function CameraDirective($sce, rtc) {
	return {
		restrict: 'E',
		link: function($scope, element, attributes) {
			var createVideo = function(stream, socketID) {
				var video = document.createElement('video');
				video.src = $sce.trustAsResourceUrl(URL.createObjectURL(stream));
				video.autoplay = true;
				video.style.display = 'block';

				if (socketID == rtc._me) video.muted = 'muted';

				console.dir(video);
				
				element.append(video);

				return {
					element: video,
					src: video.src,
					stream: stream,
					socketID: socketID
				};
			};

			$scope.sources = {};

			rtc.createStream({video: true, audio: true}, function(stream) {
				var video = createVideo(stream, rtc._me);
				$scope.sources[video.socketID] = video;
				$scope.$apply();
			});

			window.addEventListener('hashchange', function(e) {
				window.location.reload(true);
			});

			
			$scope.room = rtc.room;

			rtc.on('add remote stream', function(stream, socketID) {
				var video = createVideo(stream, socketID);
				$scope.sources[video.socketID] = video;
				$scope.$apply();
			});

			rtc.on('disconnect stream', function(socketID) {
				delete $scope.sources[socketID];
				$scope.$apply();
			});
		}
	};	
}];