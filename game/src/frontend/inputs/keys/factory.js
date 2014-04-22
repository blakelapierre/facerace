module.exports = function() {
	var w = angular.element(window)
		keymap = {};

	w.bind('keydown', function(event) {
		keymap[event.which] = true;
	});

	w.bind('keyup', function(event) {
		keymap[event.which] = false;
	});

	return keymap;
};