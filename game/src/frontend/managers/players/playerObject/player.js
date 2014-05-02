function Player(config) {
	this.simulationData = config.data;
	this.rig = config.rig;
	this.mesh = config.mesh;
	this.material = config.material;
	this.targetQuaternion = config.targetQuaternion; // what is this? I think I know, but needs a better explanation	
};

Player.prototype.update = function() {
	var rig = this.rig,
		data = this.simulationData;

	rig.position.x = data.position[0] + data.offset[0];
	rig.position.y = data.position[1] + data.offset[1];
	rig.position.z = data.position[2] + data.offset[2];
}

Player.prototype.setMode = function(mode) {
	this.mode = mode;
}

module.exports = Player;