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
		var l = db.live,
			obj = l[path] || createLive(path),
			data = obj.data,
			listeners = obj.listeners;

		if (listener) listeners.push(listener);

		l[path] = obj;

		var notify = function() {
			var args = arguments;
			_.each(listeners, function(listener) {
				listener.apply(null, args);
			});
		};

		var leave = function() {
			var index = _.indexOf(listeners, listener);
			listeners.splice(index, 1);
		};

		var core = {
			_rev: obj._rev,
			data: data,
			notify: notify,
			leave: leave
		};

		if (proxy) {
			var changeProxy = function(_rev, change) {
				var data = obj.data;
				
				obj._rev = _rev;

				if (change.set) _.extend(data, change.set);
				if (change.remove) _.keys(change.remove, function(key) { delete data[key]; });

				notify(obj._rev, 'change', change);
			};

			var snapshot = function(_rev, data) {
				obj._rev = _rev;
				obj.data = data;
				notify(obj.rev, 'snapshot', data);
				return data;
			};

			return _.extend({
				change: changeProxy,
				snapshot: snapshot
			}, core);
		}
		else 
		{
			var change = function(change) {
				var data = obj.data;

				obj._rev++;

				if (change.set) _.extend(data, change.set);
				if (change.remove) _.keys(change.remove, function(key) { delete data[key]; });

				notify(obj._rev, 'change', change);
			};

			return _.extend({
				change: change
			}, core);
		}
	};
};

var live = liveGenerator(),
	liveProxy = liveGenerator(true);


// var watch = function(path, callback) {
// 	path = path.join('.');

// 	var doc = db[path] || create(path);
	
// 	doc.listeners.push(callback);

// 	db[path] = doc;
// 	return doc;
// };

// var create = function(path) {
// 	return {
// 		path: path,
// 		listeners: [],
// 		data: otj.create({}),
// 		version: 0
// 	};
// };

// var apply = function(path, operations) {
// 	path = path.join('.');

// 	var doc = db[path];
	
// 	doc.data = otj.apply(doc.data, operations);
// 	doc.version++;

// 	_.each(doc.listeners, function(callback) { callback(path, operations); });

// 	return doc;
// };

// var change = function(path, object) {
// 	console.log(arguments);
// };
// otj.on('move', change);
// otj.on('set', change);
// otj.on('delete', change);

// _.extend(db, {
// 	watch: watch,
// 	create: create,
// 	apply: apply
// });

module.exports = {
	db: db,
	live: live,
	liveProxy: liveProxy
};