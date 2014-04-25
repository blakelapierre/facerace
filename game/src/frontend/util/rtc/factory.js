var rtc = require('webrtc.io');

module.exports = ['$rootScope', '$analytics', function($rootScope, $analytics) {
	var room = window.location.hash || '#facerace',
		url = 'ws://' + window.location.hostname + ':2887', room.split('-')[0];
	rtc.connect(url);
	$analytics.trackEvent('rtc_connect', {url: url});

	rtc.room = room;

	$rootScope.peerConnections = rtc.connections;
	rtc.on('connections', function(connections) {
		$rootScope.peerConnections = connections;
	});

	rtc.on('data stream open', function(socketID) {
		console.log('new peer', socketID);
	});

	return rtc;
}];