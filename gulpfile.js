var gulp = require('gulp');
var typescript = require('gulp-typescript');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var webserver = require('gulp-webserver');
var testApi = require('./test/api/api');

var pkg = require('./package.json');

var banner = ['/*!',
  ' * <%= pkg.name %> v<%= pkg.version %> - <%= pkg.description %>',
  ' * Copyright 2015 <%= pkg.author %>',
  ' * license <%= pkg.license %>',
  ' */',
  ''].join('\n');

gulp.task('default', ['test']);

gulp.task('watch', ['scripts'], function() {

  gulp.watch('src/**/*.ts', ['scripts']);
});

gulp.task('scripts', function() {

  return gulp.src('src/**/*.ts')
    .pipe(typescript({
      target: 'ES5',
      out: 'jquery-resource.js'
    }))
    .pipe(header(banner, {pkg: pkg}))
    .pipe(gulp.dest('release'))
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(rename('jquery-resource.min.js'))
    .pipe(gulp.dest('release'));
});

gulp.task('test', ['watch'], function() {

  gulp.src('./')
    .pipe(webserver({
      port: 3000,
      open: 'http://localhost:3000/test'
    }));

  testApi.start();
});
