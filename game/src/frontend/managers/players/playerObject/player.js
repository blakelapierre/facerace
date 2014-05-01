function Player(config) {
	this.simulationData = config.data;
	this.mesh = config.mesh;
	this.material = config.material;
};

Player.prototype.update = function() {
	var mesh = this.mesh,
		data = this.simulationData;

	mesh.position.x = data.position.x;
	mesh.position.y = data.position.y;
	mesh.position.z = data.position.z;
}

module.exports = Player;