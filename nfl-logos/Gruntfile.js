var extend = require('util')._extend;
var path = require('path');

module.exports = function(grunt) {
  var awsS3TargetConfig = {
    options: {
      bucket: 'media-beta.tribapps.com',
      differential: true,
      gzipRename: 'ext'
    },
    files: [
      {
        action: 'upload',
        expand: true,
        cwd: '<%= deployDir %>',
        src: [
          '*.gz'
        ],
        dest: 'nfl-logos/'
      },
      {
        action: 'upload',
        expand: true,
        src: [
          'nfl-logos-200x200/*.png'
        ],
        dest: 'nfl-logos/'
      },
      {
        action: 'upload',
        expand: true,
        src: [
          'examples/*'
        ],
        dest: 'nfl-logos/'
      },
      {
        action: 'upload',
        expand: true,
        src: [
          'js/*'
        ],
        dest: 'nfl-logos/'
      }
    ]
  };

  var awsS3StagingConfig = extend({}, awsS3TargetConfig);
  var awsS3ProductionConfig = extend({}, awsS3TargetConfig);
  awsS3ProductionConfig.options = extend({}, awsS3TargetConfig.options);
  awsS3ProductionConfig.options.bucket = 'media.apps.chicagotribune.com';

  var config = {
    pkg: grunt.file.readJSON('package.json'),
    deployDir: 'deploy/',
    clean: {
      deploy: ['<%= deployDir %>']
    },
    compress: {
      main: {
        options: {
          mode: 'gzip'
        },
        files: [
          {
            expand: true,
            src: [
              'nfl-logos.svg',
            ],
            dest: '<%= deployDir %>',
            ext: '.svg.gz',
            extDot: 'last'
          },
          {
            expand: true,
            src: [
              'js/*.js',
            ],
            dest: '<%= deployDir %>',
            ext: '.js.gz',
            extDot: 'last'
          }
        ]
      }
    },
    aws_s3: {
      options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      staging: awsS3StagingConfig,
      production: awsS3ProductionConfig
    }
  };

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-aws-s3');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('deploy', 'Deploy code to S3', function(n) {
    var target = grunt.option('target') || 'production';
    grunt.task.run('clean:deploy');
    grunt.task.run('compress');
    grunt.task.run('aws_s3:' + target);
  });

  grunt.registerTask('default', [
    'deploy'
  ]);
};
