module.exports = function(grunt) {
	'use strict';
	//작업시간 표시
	require('time-grunt')(grunt);
	//grunt.loadNpmTasks 생략
	require('jit-grunt')(grunt, {
		includereplace: 'grunt-include-replace'
	});
	//task 설정
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		// html 에서 인클루드를 사용합니다.
		includereplace: {
			dist: {
				options: {
					includesDir: 'src/docs/include/'
				},
				files: [{
					expand: true,
					cwd: 'src/docs/html/',
					src: ['**/*.html'],
					dest: 'dest'
				}]
			}
		},
		// html 구문검사를 합니다.
		htmlhint: {
			options: {
				htmlhintrc: 'grunt/.htmlhintrc'
			},
			dist: [
				'dest/**/*.html'
			]
		},
		// code beautifier
		jsbeautifier: {
			files: ['dest/**/*.html'],
			options: {
				html: {
					fileTypes: ['.html.erb']
				}
			}
		},
		// sass 컴파일
		sass: {
			options: {
				style: 'compact' //nested, expanded, compact, compressed
			},
			dist: {
				files: [{
					expand: true,
					cwd: 'src/styles/',
					src: ['**/*.{sass,scss}'],
					dest: 'dest/css/',
					ext: '.css'
				}]
			}
		},
		// css 벤더프리픽스 추가
		autoprefixer: {
			options: [
				'Android 2.3',
				'Android >= 4',
				'Chrome >= 20',
				'Explorer >= 8',
				'iOS >= 6',
				'Opera >= 12',
				'Safari >= 6'
			],
			dist: {
				src: 'dest/css/*.css'
			}
		},
		// css 속성 정렬
		csscomb: {
			options: {
				config: 'grunt/.csscomb.json'
			},
			dist: {
				expand: true,
				cwd: 'dest/css/',
				src: ['*.css', '!*.min.css'],
				dest: 'dest/css/'
			}
		},
		// css minify
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
					cwd: 'dest/css',
					src: ['*.css', '!*.min.css'],
					dest: 'dest/css/',
					ext: '.min.css'
				}]
			}
		},
		// js 구문검사
		jshint: {
			options: {
				jshintrc: 'grunt/.jshintrc',
				reporter: require('jshint-stylish')
			},
			grunt: {
				src: ['Gruntfile.js']
			},
			dist: {
				src: 'src/js/site/*.js'
			}
		},
		// 파일 합치기
		concat: {
			options: {
				stripBanners: false,
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */'
			},
			dist: {
				src: 'src/js/site/*.js',
				dest: 'dest/js/site.js'
			}
		},
		// JS uglify
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */'
			},
			dist: {
				src: 'dest/js/site.js',
				dest: 'dest/js/site.min.js'
			}
		},
		// 폴더 및 파일 삭제
		clean: {
			dist: {
				files: [{
					dot: true,
					nonull: true,
					src: ['dest']
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
					// 	cwd: 'src/fonts/',
					// 	src: '**',
					// 	dest: 'dest/fonts/'
					// }
				]
			}
		},
		// image 최적화
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: 'src/images/',
					src: '**/*.{png,jpeg,jpg,gif}',
					dest: 'dest/images/'
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
				files: ['src/docs/**/*.html'],
				tasks: ['includereplace', 'htmlhint', 'jsbeautifier']
			},
			sass: {
				files: ['src/styles/**/*.{sass,scss}'],
				tasks: ['sass','autoprefixer','csscomb','cssmin']
			},
			jsnt: {
				files: ['src/js/**/*.js'],
				tasks: ['jshint','concat','uglify']
			},
			img: {
				files: ['src/images/**/*.{png,jpeg,jpg,gif}'],
				tasks: ['newer:imagemin'],
			}
			//,
			// fonts: {
			// 	files: ['src/fonts/**/*'],
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
					base: 'dest',
					open: 'http://<%= connect.server.options.hostname %>:<%= connect.server.options.port %>/category1/page-01.html'
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