module.exports = ['$rootScope', function($scope) {
	var scene, cssScene, eventHandlers;

	var dispatch = function(event) {
		console.log('e', event);
		(eventHandlers[event.type] || function() { })(event);
	};

	return {
		setScene: function(s, cs) {
			if (scene) {} // detach?
			scene = s;
			cssScene = cs;

			eventHandlers = {
				mode: function(event) {
					_.each($scope.liveSources, function(source) {
						source.mode = event._event;

						var swirl = (source.mode == 'testMode' ? '-swirl' : '');
						var video = source.element,
							width = 1,
							height = 1,
							material = new THREE.ShaderMaterial({
								fragmentShader: document.getElementById('plane-fragment-shader' + swirl).textContent,
								vertexShader: document.getElementById('plane-vertex-shader' + swirl).textContent,
								uniforms: {
									texture: {type: 't', value: source.texture},
									width: {type: 'f', value: width},
									height: {type: 'f', value: height},
									radius: {type: 'f', value: 2},
									angle: {type: 'f', value: 0.8},
									center: {type: 'v2', value: new THREE.Vector2(width / 2, height / 2)},
									time: {type: 'f', value: 1.0}
								},
								side: THREE.DoubleSide,
								blending: THREE.NormalBlending
							});

						source.material = material;
						source.mesh.material = material;
					});
				},
				player: function(event) {
					console.log('player', event);
				},
				video: function(event) {
					console.log('video', event);
				},
				setMap: function(event) {
					mapLoader(scene, event._event);
				}
			};

			return dispatch;
		},
		dispatch: dispatch
	};
}];