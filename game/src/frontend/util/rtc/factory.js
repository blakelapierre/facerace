var rtc = require('webrtc.io');

module.exports = ['$rootScope', '$analytics', function($rootScope, $analytics) {
	var room = window.location.hash || '#facerace',
		url = 'ws://' + window.location.hostname + ':2887';
	rtc.connect(url, room);

	$analytics.eventTrack('rtc_connect', {category: url, action: 'connect', label: room});
	$analytics.pageTrack('/' + room);

	rtc.room = room;

	$rootScope.webrtc = {
		peerConnections: rtc.connections,
		dataChannels: rtc.dataChannels,
		streams: rtc.streams
	};

	rtc.on('connections', function(connections) {
		$rootScope.webrtc.peerConnections = connections;
	});

	rtc.on('data stream open', function(socketID) {
		console.log('new peer', socketID);
	});

	rtc.requestFile = function(peerConnectionID, fileName) {
		var channel = rtc.dataChannels[peerConnectionID];

		if (channel) {
			channel.send(fileName);
		}
	};

	rtc.sendFile = function(channel, file) {
		var chunkSize = 64 * 1024,
			reader = new FileReader();

		reader.onload = function(e) {
			var result = e.target.result;

			channel.send(result.byteLength + ';' + file.name);

			var offset = 0,
				backoff = 0,
				startTime = new Date().getTime();
			var sendChunk = function() {
				if (offset == result.byteLength) return;

				var now = new Date().getTime();

				for (var i = 0; i < 10; i++) {
					var size = Math.min(offset + chunkSize, result.byteLength),
						chunk = result.slice(offset, size);
					try {
						channel.send(chunk);
						offset += chunkSize;
						$rootScope.upSpeed = offset / (now - startTime) / 1000;	
					} catch(e) {
						setTimeout(sendChunk, backoff);
						backoff += 100;
					}

					if (offset < result.byteLength) setTimeout(sendChunk, 0);
				}
			};
			sendChunk();
		};

		reader.readAsArrayBuffer(file);
	};

	return rtc;
}];