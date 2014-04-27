module.exports = function() {
	return function(obj, indent) {
		return JSON.stringify(obj, null, indent || '|\u00b7\u00b7');
	};
};