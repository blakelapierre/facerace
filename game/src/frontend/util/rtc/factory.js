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

	rtc.sendFile = function(peerConnectionID, fileReader) {
		var channel = rtc.dataChannels[peerConnectionID];

		if (channel) {
			console.log(fileReader);
		}
	};

	return rtc;
}];