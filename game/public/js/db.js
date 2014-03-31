var _ = require('lodash');

var db = {
	_rev: 0,
	live: {}, // Objects in here are a free-for-all: last-write-wins!
	proprietary: {}, // Objects in here are owned; property rights may or may not exist and may or may not be enforced
	shared: {} // Objects in here might have some kind of process for collaborative modifications
};

var live = function(path, listener) {
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

	var change = function(change) {
		obj._rev++;

		if (change.set) _.extend(data, change.set);
		if (change.remove) _.keys(change.remove, function(key) { delete data[key]; });

		notify(obj._rev, 'change', change);
	};

	var leave = function() {
		var index = _.indexOf(listeners, listener);
		listeners.splice(index, 1);
	};
	
	return {
		snapshot: {
			_rev: obj._rev,
			data: data
		},
		change: change,
		leave: leave
	};
};

var liveProxy = function(path, listener) {
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

	var change = function(_rev, change) {
		var data = obj.data;
		
		obj._rev = _rev;

		if (change.set) _.extend(data, change.set);
		if (change.remove) _.keys(change.remove, function(key) { delete data[key]; });

		notify(obj._rev, 'change', change);
	};

	var leave = function() {
		var index = _.indexOf(listeners, listener);
		listeners.splice(index, 1);
	};

	var snapshot = function(_rev, data) {
		obj._rev = _rev;
		obj.data = data;
		notify(obj.rev, 'snapshot', data);
		return data;
	};

	return {
		data: data,
		change: change,
		leave: leave,
		snapshot: snapshot
	};
};

var createLive = function(path) {
	return {
		_rev: 0,
		path: path,
		listeners: [],
		data: {}
	};
};

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