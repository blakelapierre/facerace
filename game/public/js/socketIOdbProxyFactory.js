var db = require('./db/socketIOdb');

module.exports = ['socket', function SocketIOdbProxyFactory(socket) {
	var live = function(path, listener) {
		return db.proxy(socket, path, listener);
	};
	
	return {
		live: live
	};
}];