var gulp = require('gulp');
var typescript = require('gulp-typescript');
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var webserver = require('gulp-webserver');
var testApi = require('./test/api/api');

gulp.task('default', ['watch', 'test']);

gulp.task('watch', ['scripts'], function() {

  gulp.watch('src/**/*.ts', ['scripts']);
});

gulp.task('scripts', function() {

  gulp.src('src/**/*.ts')
    .pipe(typescript({
      target: 'ES5',
      out: 'jquery-resource.js'
    }))
    .pipe(gulp.dest('release'))
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(rename('jquery-resource.min.js'))
    .pipe(gulp.dest('release'));
});

gulp.task('test', function() {

  gulp.src('./')
    .pipe(webserver({
      port: 3000,
      open: 'http://localhost:3000/test'
    }));

  testApi.start();
});
