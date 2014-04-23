module.exports = function($rootScope) {
	var lastRender = 0,
		thisRender = 0,
		dt = 0,
		renderCount = 0;

	var activeRender = function() {
		thisRender = new Date().getTime();
		dt = thisRender - lastRender;
		renderCount++;

		window.requestAnimationFrame(render);

		$rootScope.$emit('updateScene', dt, thisRender, renderCount);
		$rootScope.$emit('renderFrame', dt, thisRender, renderCount);
	};

	var pausedRender = function() {};

	return {
		start: function() {
			lastRender = 0;
			thisRender = 0;
			renderCount = 0;

			render = activeRender;
			window.requestAnimationFrame(render);
		},
		stop: function() {
			render = pausedRender;
		}
	};
};