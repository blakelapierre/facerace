module.exports = function() {
	var loadCubeMap = function(map) {
		var urls = _.map(['px', 'nx', 'py', 'ny', 'pz', 'nz'], function(face) {
			return '/images/' + map + '/cubemap-' + face + '.png';
        });

        return THREE.ImageUtils.loadTextureCube(urls);
	};

	return function(scene, map) {
		var mapData = scene._mapData || {},
			skybox = mapData.skybox,
			course = mapData.course,
			pointLight = mapData.pointLight;

		if (skybox) scene.remove(skybox);
		if (course) scene.remove(course);
		if (pointLight) scene.remove(pointLight);

		var cubemap = loadCubeMap(map);

        var shader = THREE.ShaderLib[ "cube" ];
        shader.uniforms[ "tCube" ].value = cubemap;

        var material = new THREE.ShaderMaterial( {
          fragmentShader: shader.fragmentShader,
          vertexShader: shader.vertexShader,
          uniforms: shader.uniforms,
          depthWrite: false,
          side: THREE.DoubleSide
        });

        pointLight = new THREE.PointLight(0xffffff, 2);
		scene.add(pointLight);

        skybox = new THREE.Mesh( new THREE.CubeGeometry( 10000, 10000, 10000 ), material );
        scene.add(skybox);

        course = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 1000), new THREE.MeshBasicMaterial({color: 0x222222}));
        course.rotateX(-Math.PI / 2);
        course.position.y = -0.5;
        scene.add(course);

        mapData.skybox = skybox;
        mapData.course = course;
        mapData.pointLight = pointLight;
	};	
};