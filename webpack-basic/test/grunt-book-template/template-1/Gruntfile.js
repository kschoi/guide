module.exports = function (grunt) {

    'use strict';

    // 작업시간 표시
    require('time-grunt')(grunt);

    // 자동으로 grunt 태스크를 로드합니다. grunt.loadNpmTasks 를 생략한다.
    require('load-grunt-tasks')(grunt);

    var config = {
        src: 'SourceCode',          // 소스파일이 있는 폴더
        dest: 'FinishCode',         // 빌드후 완료파일이 있는 폴더
        bower: 'bower_components'   // bower 플러그인이 설치되는 폴더
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: config,

        // html 에서 인클루드를 사용합니다.
        includes: {
            dist: {
                expand: true,
                cwd: '<%= config.src %>/docs/html/',
                src: ['**/*.html'],
                dest: '<%= config.dest %>',
                options: {
                    flatten: true,
                    // debug: true,
                    includePath: '<%= config.src %>/docs/include/'
                }
            }
        },
        // html 구문검사를 합니다.
        htmlhint: {
            options: {
                htmlhintrc: 'grunt/.htmlhintrc'
            },
            dist: [
                '<%= config.dest %>/**/*.html',
            ]
        },

        less: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */',
                dumpLineNumbers : 'comments' // 디버깅할때 사용
            },
            dist: {
                src: '<%= config.src %>/less/site.less',
                dest: '<%= config.dest %>/css/site.css'
            },
        },
        // css 구문검사를 합니다.
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
             options: {
                browsers: [
                    'Android 2.3',
                    'Android >= 4',
                    'Chrome >= 20',
                    'Firefox >= 24', // Firefox 24 is the latest ESR
                    'Explorer >= 8',
                    'iOS >= 6',
                    'Opera >= 12',
                    'Safari >= 6'
                ]
            },
            dist: {
                src: '<%= config.dest %>/css/*.css'
            }
        },
        // css 의 속성을 정렬해줍니다.
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
        // css 를 압축합니다.
        cssmin: {
            options: {
                compatibility: 'ie8',
                keepSpecialComments: '*',
                noAdvanced: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.dest %>/css',
                    src: ['*.css', '!*.min.css'],
                    dest: '<%= config.dest %>/css',
                    ext: '.min.css'
                }]
            }
        },

        // 자바스크립트 구문검사를 합니다.
        jshint: {
            options: {
                jshintrc: 'grunt/.jshintrc',
                // force: true, // error 검출시 task를 fail 시키지 않고 계속 진단
                reporter: require('jshint-stylish') // output을 수정 할 수 있는 옵션
            },
            grunt: {
                src: ['Gruntfile.js']
            },
            dist: {
                src: '<%= config.src %>/js/site/*.js'
            }
        },

        // 파일을 합칩니다.
        concat: {
            options: {
                
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            jquery: {
                src: [
                    '<%= config.bower %>/jquery/dist/jquery.js',
                    '<%= config.bower %>/jquery-migrate/jquery-migrate.js',
                ],
                dest: '<%= config.dest %>/js/jquery.js'
            },
            plugins: {
                src: [
                    '<%= config.bower %>/bootstrap/dist/js/bootstrap.min.js',
                    '<%= config.bower %>/jquery-ui/jquery-ui.min.js',
                ],
                dest: '<%= config.dest %>/js/plugins.js'
            },
            site: {
                src: '<%= config.src %>/js/site/*.js',
                dest: '<%= config.dest %>/js/site.js'
            }
        },

        // 압축합니다.
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            jquery: {
                src: '<%= concat.jquery.dest %>',
                dest: '<%= config.dest %>/js/jquery.min.js'
            },
            plugins: {
                src: '<%= concat.plugins.dest %>',
                dest: '<%= config.dest %>/js/plugins.min.js'
            },
            site: {
                src: '<%= concat.site.dest %>',
                dest: '<%= config.dest %>/js/site.min.js'
            }
        },

        // 폴더 및 파일을 삭제합니다.
        clean: {
            dist: {
                files: [{
                    src: '<%= config.dest %>'
                }]
            },
        },

        // 폴더 및 파일을 복사합니다.
        copy: {
            dist: {
                files: [ 
                    // fonts
                    {
                        expand: true,
                        cwd: '<%= config.src %>/fonts/',
                        src: '**',
                        dest: '<%= config.dest %>/fonts/'
                    },
                    // bootstrap fonts
                    {
                        expand: true,
                        cwd: '<%= config.bower %>/bootstrap/dist/fonts/',
                        src: '**',
                        dest: '<%= config.dest %>/fonts/'
                    },
                    // bootstrap css
                    {
                        expand: true,
                        cwd: '<%= config.bower %>/bootstrap/dist/css/',
                        src: 'bootstrap.min.css',
                        dest: '<%= config.dest %>/css/'
                    },
                ]
            }
        },

        // 이미지를 최적화 합니다.
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.src %>/images/',
                    src: '**/*.{png,jpeg,jpg,gif}',
                    dest: '<%= config.dest %>/images/'
                }]
            }
        },

        // 병렬로 작업을 실행합니다.
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            dist: [
                'copy',
                'imagemin'
            ]
        },

        // 감시를 합니다.
        watch: {
            options: { livereload: true },
            gruntfile: {
                files: ['Gruntfile.js'],
                tasks: ['jshint:grunt'],
            },
            html: {
                files: ['<%= config.src %>/docs/**/*.html'],
                tasks: ['includes','htmlhint'],
            },
            less: {
                files: ['<%= config.src %>/less/**/*.less'],
                tasks: ['less','csslint','autoprefixer','csscomb','cssmin'],
            },
            js: {
                files: ['<%= config.src %>/js/**/*.js'],
                tasks: ['jshint','concat','uglify'],
            },
            img: {
                files: ['<%= config.src %>/images/**/*.{gif,jpeg,jpg,png}'],
                tasks: ['newer:imagemin'],
            },
        },

        // 서버를 열어서 브라우져에서 확인합니다.
        connect: {
            server: {
                options: {
                    port: 9000,
                    hostname: 'localhost',
                    livereload: 35729,
                    // keepalive: true,
                    base: '<%= config.dest %>',
                    open: 'http://<%= connect.server.options.hostname %>:<%= connect.server.options.port %>/index.html'
                }
            }
        },


    });

    // 작업을 로드합니다.
    // grunt.loadNpmTasks('grunt-contrib-jshint');

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
            // 'clean',
            'includes',
            'htmlhint'
        ]
    );

    // css task
    grunt.registerTask('css', [
            // 'clean',
            'less',
            'csslint',
            'autoprefixer',
            'csscomb',
            'cssmin'
        ]
    );

    // javascript task
    grunt.registerTask('jsnt', [
            'jshint',
            'concat',
            'uglify'
        ]
    );

    grunt.registerTask('default', [
        'clean',
        'html',
        'css',
        'jsnt',
        'concurrent',
    ]);


};
