var _ = require('lodash');

var db = {
	_rev: 0,
	live: {}, // Objects in here are a free-for-all: last-write-wins!
	proprietary: {}, // Objects in here are owned; property rights may or may not exist and may or may not be enforced
	shared: {} // Objects in here might have some kind of process for collaborative modifications
};


var liveGenerator = function(proxy) {
	var createLive = function(path) {
		return {
			_rev: 0,
			path: path,
			listeners: [],
			data: {}
		};
	};

	return function(path, listener) {
		var live = db.live,
			obj = live[path] || createLive(path),
			data = obj.data,
			listeners = obj.listeners;

		if (listener) listeners.push(listener);

		live[path] = obj;

		var notify = function() {
			var args = arguments;
			_.each(listeners, function(listener) {
				listener.apply(listener, args);
			});
		};

		var leave = function() {
			var index = _.indexOf(listeners, listener);
			listeners.splice(index, 1);
		};

		var core = {
			_rev: obj._rev,
			data: data,
			leave: leave
		};

		var change = function(_rev, change) {
			console.log('got change', _rev, change);
			var data = obj.data;
			
			obj._rev = _rev;

			if (change.set) _.extend(data, change.set);
			if (change.remove) _.keys(change.remove, function(key) { delete data[key]; });

			notify('change', obj._rev, change);

			return data;
		};

		if (proxy) {
			return _.extend({
				change: function(_rev, c) {
					if (_rev > obj._rev) change(_rev, c);
				}
			}, core);
		}
		else 
		{
			return _.extend({
				change: function(c) {
					change(obj._rev + 1, c);
				}
			}, core);
		}
	};
};

var live = liveGenerator(),
	liveProxy = liveGenerator(true);

module.exports = {
	db: db,
	live: live,
	liveProxy: liveProxy
};