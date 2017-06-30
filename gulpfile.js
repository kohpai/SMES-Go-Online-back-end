var gulp = require('gulp')
var nodemon = require('gulp-nodemon')
var jshint = require('gulp-jshint')

gulp.task('reload', function () {
  gulp.src('./**/*.js')
    .pipe(jshint())
})

gulp.task('develop', function () {
  nodemon({
    script: 'server.js',
    ext: 'js',
    tasks: ['reload'] })
    .on('restart', function () {
      console.log('server.js restarted!')
    })
})