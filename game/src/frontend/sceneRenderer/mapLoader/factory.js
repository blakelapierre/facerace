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
      pointLight = mapData.pointLight;

    if (skybox) scene.remove(skybox);
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

    mapData.skybox = skybox;
    mapData.pointLight = pointLight;

    scene._mapData = mapData;
  };  
};