var gulp = require('gulp');
var ts = require('gulp-typescript');
var webserver = require('gulp-webserver');
var testApi = require('./test/api/api');

gulp.task('default', ['watch']);

gulp.task('watch', ['scripts'], function() {

  gulp.watch('src/**/*.ts', ['scripts']);
});

gulp.task('scripts', function() {

  var tsConfig = {
    target: 'ES5',
    out: "jquery-resource.js"
  };

  gulp.src(['src/**/*.ts'])
    .pipe(ts(tsConfig))
    .pipe(gulp.dest("release"));
});

gulp.task('test', function() {

  gulp.src('./')
    .pipe(webserver({
      port: 3000,
      open: 'http://localhost:3000/test'
    }));

  testApi.start();
});
