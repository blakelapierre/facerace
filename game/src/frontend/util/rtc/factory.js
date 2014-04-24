var rtc = require('webrtc.io');

module.exports = function($rootScope) {
	var room = window.location.hash || '#facerace';
	rtc.connect('ws://' + window.location.hostname + ':2887', room.split('-')[0]);

	rtc.room = room;

	$rootScope.peerConnections = rtc.connections;
	rtc.on('connections', function(connections) {
		$rootScope.peerConnections = connections;
		console.log(connections);
	});

	rtc.on('data stream open', function(socketID) {
		console.log('new peer', socketID);
	});

	return rtc;
};