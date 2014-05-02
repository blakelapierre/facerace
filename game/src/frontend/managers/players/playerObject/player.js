function Player(config) {
	this.simulationData = config.data;
	this.mesh = config.mesh;
	this.material = config.material;
	this.targetQuaternion = config.targetQuaternion; // what is this? I think I know, but needs a better explanation	
};

Player.prototype.update = function() {
	var mesh = this.mesh,
		data = this.simulationData;

	mesh.position.x = data.position[0];
	mesh.position.y = data.position[1];
	mesh.position.z = data.position[2];

	console.log(mesh, data);
}

Player.prototype.setMode = function(mode) {
	this.mode = mode;
	console.log(this);
}

module.exports = Player;