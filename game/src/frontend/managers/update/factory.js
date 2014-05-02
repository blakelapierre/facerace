module.exports = [
	'$rootScope', 'facerace', 'eventsManager', 'mapLoader', 'orientation', 
	function($scope, facerace, eventsManager, mapLoader, orientation) {

	var scene, cssScene;

	var dispatch = eventsManager.dispatch;

	var setScene = function(s, cs, camera) {
		if (scene) {} // detach?

		scene = s;
		cssScene = cs;

		// I don't think we can detach from scope...not documented anyway
		$scope.$on('updateScene', (function() {
			var waitingForState = function(transport, now, dt) {
				if (transport.state && transport.state._yourID != null) {
					$scope.stateObj = transport.state;
					updateFn = haveState;
					if (transport.state.map) mapLoader(scene, transport.state.map);
				}
			};

			var haveState = (function () {
				var hasOrientationChanged = (function() {
					var lastOrientation = {
						quaternion: [0, 0, 0, 1]
					};

					return function(orientation) {
						var q = orientation.quaternion,
							lq = lastOrientation.quaternion;

						if (q[0] == lq[0] && q[1] == lq[1] && q[2] == lq[2] && q[3] == lq[3]) return false;

						lq[0] = q[0];
						lq[1] = q[1];
						lq[2] = q[2];
						lq[3] = q[3];

						return true;
					};
				})();

				var maxfps = 30,
					lastControlUpdate = new Date().getTime(),
					controlUpdatesPerSecond = 4;

				return (function() {
					function updateVideoSources(framerate, now) {
						_.each($scope.liveSources, function(source, id) {
							var element = source.element;
							if (element.readyState == element.HAVE_ENOUGH_DATA &&
								now - source.texture.lastUpdate > (1000 / framerate) ) {
								source.texture.needsUpdate = true;
								source.texture.lastUpdate = now;
							}
							source.material.uniforms.time.value += 1;
						});
					};

					return function(transport, now, dt) {
						if (transport) {
							$scope.$broadcast('newState', transport);

							$scope.stateObj = transport.state;

							var player = $scope.livePlayers[transport.state._yourID];
							if (player) camera.lookAt(player.mesh.position);

							

							$scope.players = transport.state.players;

							if (now - lastControlUpdate > (1000 / controlUpdatesPerSecond)) {
								var o = orientation();

								if (hasOrientationChanged(o)) facerace.orientation(o);

								lastControlUpdate = now;
							}

							_.each(transport.events.processedEvents, dispatch);

							_.each($scope.livePlayers, function(player) {
								var data = player.simulationData,
									q = data.orientation.quaternion,
									tq = player.targetQuaternion,
									mesh = player.mesh,
									mq = mesh.quaternion;

								tq.set(q[0], q[1], q[2], q[3]);
								mq.slerp(tq, 0.05);
							});

							$scope.$apply();
						}

						updateVideoSources($scope.stateObj.videoFrameRate || 30, now);
					};
				})();
			})();

			var updateFn = waitingForState;	

			var lastFrame = new Date().getTime(),
				transport = {};
			return function () {
				var now = new Date().getTime(),
					dt = now - lastFrame;

				var result = facerace(transport);

				updateFn(result, now, dt);

				if (result) {
					transport = result;

					lastFrame = now;
				}
			};
		})());
	};

	return {
		setScene: setScene
	}
}];
