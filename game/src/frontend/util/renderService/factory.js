module.exports = function($rootScope) {
  var start = 0,
    lastRender = 0,
    absolute = 0,
    dt = 0,
    renderCount = 0;

  var activeRender = function() {
    absolute = new Date().getTime();
    dt = absolute - lastRender;
    renderCount++;

    window.requestAnimationFrame(render);

    var elapsed = new Date().getTime() - start;

    $rootScope.$broadcast('updateScene', dt, elapsed, absolute, renderCount);
    $rootScope.$broadcast('renderScene', dt, elapsed, absolute, renderCount);
  };

  var pausedRender = function() {};

  return {
    start: function() {
      start = new Date().getTime();
      lastRender = 0;
      absolute = 0;
      renderCount = 0;

      render = activeRender;
      window.requestAnimationFrame(render);
    },
    stop: function() {
      render = pausedRender;
    }
  };
};