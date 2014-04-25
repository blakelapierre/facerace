var rtc = require('webrtc.io');

module.exports = ['$rootScope', '$analytics', function($rootScope, $analytics) {
	var room = window.location.hash || '#facerace';
	rtc.connect('ws://' + window.location.hostname + ':2887', room.split('-')[0]);

	$analytics.eventTrack('rtc_connect', {room: room, host: window.location.hostname});
	$analytics.pageTrack('/' + room);

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