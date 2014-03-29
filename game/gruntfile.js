module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		pkg: pkg,
		bgShell: {
			_defaults: {
				bg: true
			},
			browserify: {
				cmd: 'browserify public/js/facerace.js > public/js/bundle.js'
			},
			startServer: {
				cmd: 'node server.js',
				bg: false
			},
			startClient: {
				cmd: 'xdg-open http://localhost:2888'
			}
		}
	});

	grunt.loadNpmTasks('grunt-bg-shell');

	grunt.registerTask('default' , '', function(numberClients) {
		numberClients = numberClients || 1;

		for (var i = 0; i < numberClients; ++i) {
			grunt.task.run('bgShell:startClient');
		}
		grunt.task.run('serve');
	});

	grunt.registerTask('serve', 'test', function() {
		grunt.task.run('bgShell:browserify');
		grunt.task.run('bgShell:startServer');
	});
};