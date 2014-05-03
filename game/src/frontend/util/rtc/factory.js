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
		var chunkSize = 32 * 1024,
			reader = new FileReader();

		reader.onload = function(e) {
			var result = e.target.result;

			channel.send(result.byteLength + ';' + file.name);

			var offset = 0;
			var sendChunk = function() {
				if (offset == result.byteLength) return;

				var size = Math.min(offset + chunkSize, result.byteLength),
					chunk = result.slice(offset, size);
				try {
					channel.send(chunk);
					offset += chunkSize;
					sendChunk();
				} catch(e) {
					setTimeout(sendChunk, 500);
				}
			};
			sendChunk();
		};

		reader.readAsArrayBuffer(file);
	};

	return rtc;
}];