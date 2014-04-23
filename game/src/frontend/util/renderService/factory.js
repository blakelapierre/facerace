module.exports = function($rootScope) {
	var activeRender = function() {
		window.requestAnimationFrame(render);

		$rootScope.$emit('updateScene');
		$rootScope.$emit('renderFrame');
	};

	var pausedRender = function() {};

	return {
		start: function() {
			render = activeRender;
			window.requestAnimationFrame(render);
		},
		stop: function() {
			render = pausedRender;
		}
	};
};