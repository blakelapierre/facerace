module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json');

	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: pkg,
		bgShell: {
			_defaults: {
				bg: true
			},
			startClient: {
				cmd: 'xdg-open http://localhost:2888'
			}
		},
		watch: {
			game: {
				files: ['server.js', 'public/**/*.*', 'frontend/**/*.*', '!public/style.css', '!public/bundle.js'],
				tasks: ['less:bundle', 'browserify:bundle', 'express:dev'],
				options: {
					livereload: true
				}
			}
		},
		browserify: {
			bundle: {
				files: {
					'public/bundle.js': ['frontend/app.js']
				}
			}
		},
		express: {
			dev: {
				options: {
					script: 'server.js'
				}
			}
		},
		less: {
			bundle: {
				files: {
					'public/style.css': ['frontend/**/*.less']
				}
			}
		}
	});

	grunt.registerTask('default' , '', function(numberClients) {
		numberClients = numberClients || 1;

		for (var i = 0; i < numberClients; ++i) {
			grunt.task.run('bgShell:startClient');
		}
		grunt.task.run('serve');
	});

	grunt.registerTask('serve', 'test', function() {
		grunt.task.run('less:bundle', 'browserify:bundle', 'express:dev', 'watch:game');
	});
};