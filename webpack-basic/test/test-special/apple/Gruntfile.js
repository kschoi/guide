module.exports = function(grunt) {

	'use strict';

	// 작업시간 표시
	require('time-grunt')(grunt);

	// grunt task load (grunt.loadNpmTasks 생략)
	require('jit-grunt')(grunt, {
		includereplace: 'grunt-include-replace',
		sass: 'grunt-sass'
	});

	var config = {
		src: 'src',		// 소스파일 폴더
		dest: 'dist'	// 빌드완료 폴더
	}

	// task 설정
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		config: config,

		includereplace: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.src %>/docs/html/',
					src: ['**/*.html'],
					dest: '<%= config.dest %>'
				}],
				options: {
					includesDir: '<%= config.src %>/docs/include/'
				}
			}
		},
		htmlhint: {
			options: {
				htmlhintrc: 'grunt/.htmlhintrc'
			},
			dist: [
				'<%= config.dest %>/**/*.html'
			]
		},
		jsbeautifier: {
			files: ['<%= config.dest %>/**/*.html'],
			options: {
				html: {
					preserveNewlines: false,
					fileTypes: ['.html.erb']
				}
			}
		},
		sass: {
			options: {
				style: 'compact' //nested, expanded, compact, compressed
			},
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.src %>/styles/',
					src: ['**/*.{sass,scss}'],
					dest: '<%= config.dest %>/css/',
					ext: '.css'
				}]
			}
		},
		csslint: {
			options: {
				csslintrc: 'grunt/.csslintrc'
			},
			dist: {
				src: [
					'<%= config.dest %>/css/site.css',
				]
			}
		},
		autoprefixer: {
			options: [
				'Android 2.3',
				'Android >= 4',
				'Chrome >= 20',
				'Explorer >= 8',
				'iOS >= 6',
				'Safari >= 6'
			],
			dist: {
				src: '<%= config.dest %>/css/*.css'
			}
		},
		csscomb: {
			options: {
				config: 'grunt/.csscomb.json'
			},
			dist: {
				expand: true,
				cwd: '<%= config.dest %>/css/',
				src: ['*.css', '!*.min.css'],
				dest: '<%= config.dest %>/css/'
			}
		},
		cssmin: {
			options: {
				compatibility: 'ie9',
				keepSpecialComments: '*',
				sourceMap: true,
				advanced: false
			},
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.dest %>/css',
					src: ['*.css', '!*.min.css'],
					dest: '<%= config.dest %>/css/',
					ext: '.min.css'
				}]
			}
		},
		jshint: {
			options: {
				jshintrc: 'grunt/.jshintrc',
				reporter: require('jshint-stylish')
			},
			grunt: {
				src: ['Gruntfile.js']
			},
			dist: {
				src: '<%= config.src %>/js/**/*.js'
			}
		},
		concat: {
			options: {
				stripBanners: false,
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */'
			},
			dist: {
				src: '<%= config.src %>/js/*.js',
				dest: '<%= config.dest %>/js/special.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */'
			},
			dist: {
				src: '<%= config.dest %>/js/special.js',
				dest: '<%= config.dest %>/js/special.min.js'
			}
		},
		// 폴더 및 파일 삭제
		clean: {
			dist: {
				files: [{
					dot: true,
					nonull: true,
					src: ['<%= config.dest %>']
				}]
			}
		},
		// 폴더 및 파일 복사
		copy: {
			dist: {
				files: [
					// fonts
					// {
					// 	expand: true,
					// 	cwd: '<%= config.src %>/fonts/',
					// 	src: '**',
					// 	dest: '<%= config.dest %>/fonts/'
					// }
				]
			}
		},
		// image 최적화
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.src %>/img/',
					src: '**/*.{png,jpeg,jpg,gif}',
					dest: '<%= config.dest %>/img/'
				}]
			}
		},
		// 병렬 작업 실행
		concurrent: {
			options: {
				logConcurrentOutput: true
			},
			dist: [
				'copy',
				'imagemin'
			]
		},
		// 감시
		watch: {
			options: { livereload: true },			
			html: {
				files: ['<%= config.src %>/docs/**/*.html'],
				tasks: ['includereplace', 'htmlhint', 'jsbeautifier']
			},
			sass: {
				files: ['<%= config.src %>/styles/**/*.{sass,scss}'],
				tasks: ['sass','csslint','autoprefixer','csscomb','cssmin']
			},
			jsnt: {
				files: ['<%= config.src %>/js/**/*.js'],
				tasks: ['jshint','concat','uglify']
			},
			img: {
				files: ['<%= config.src %>/img/**/*.{png,jpeg,jpg,gif}'],
				tasks: ['newer:imagemin'],
			}
			//,
			// fonts: {
			// 	files: ['<%= config.src %>/fonts/**/*'],
			// 	tasks: ['newer:copy']
			// }
		},
		// 브라우저 확인
		 connect: {
			server: {
				options: {
					port: 9000,
					hostname: 'localhost',
					livereload: 35729,
					// keepalive: true,
					base: 'dist',
					open: 'http://<%= connect.server.options.hostname %>:<%= connect.server.options.port %>/main.html'
				}
			}
		}
	});
	// server
	grunt.registerTask('serve', function (target) {
		if (target === 'dist') {
			return grunt.task.run(['connect', 'watch']);
		}
		grunt.task.run([
			'default', 
			'connect', 
			'watch'
		]);
	});
	// html task
	grunt.registerTask('html', [
		'includereplace',
		'htmlhint',
		'jsbeautifier'
	]);
	// css task
	grunt.registerTask('css', [
		'sass',
		'csslint',
		'autoprefixer',
		'csscomb',
		'cssmin'
	]);
	// js task
	grunt.registerTask('jsnt', [
		'jshint',
		'concat',
		'uglify'
	]);
	grunt.registerTask('default', [
		'clean',
		'html',
		'css',
		'jsnt',
		'concurrent'
	]);
}