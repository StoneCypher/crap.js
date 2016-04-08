
'use strict';



var fs           = require('fs'),
    path         = require('path'),

    del          = require('del'),
    source       = require('vinyl-source-stream'),
    gulp         = require('gulp'),

    browserify   = require('browserify'),

    esdoc        = require('gulp-esdoc'),
    rename       = require('gulp-rename'),
    closure      = require('gulp-closure-compiler'),
    babel        = require('gulp-babel');



var dirs         = { 'dist': './dist', 'doc': './doc' },
    babel_cfg    = { 'presets': [ 'es2015' ] };



var production   = false,

    errorHandler = function(err) {
      console.log(err.toString());
      this.emit('end');
    };





gulp.task('babel', ['setup'], function() {

  return gulp.src(['src/pbar.js'])
    .pipe(babel(babel_cfg))
    .pipe(rename('pbar.es5.js'))
    .pipe(gulp.dest('./dist'));

});





gulp.task('clean', function(done) {
  del(['./doc', './dist']).then(() => done());
});





gulp.task('browserify', ['babel'], function() {

  var browserifyConfig = {}, 
      bpack            = browserify(browserifyConfig, { 'debug' : !production });

  return bpack
    .require('./dist/pbar.es5.js', { 'expose' : 'pbar' })
    .bundle()
    .on('error', errorHandler)
    .pipe(source('pbar.es5.js'))
    .pipe(gulp.dest('./dist'));

});





gulp.task('closure5', ['build'], function() {

  return gulp.src('dist/pbar.es5.js')

    .pipe(closure( {
      compilerPath: 'node_modules/closure-compiler/node_modules/google-closure-compiler/compiler.jar',
      fileName: 'pbar.es5.min.js'
    } ))
    
    .pipe(gulp.dest('./dist'));

});





// temp disabled - "export {foo}" kills closure compiler in es6 mode
// https://github.com/google/closure-compiler/issues/1636
// appears to be fixed in unreleased https://github.com/google/closure-compiler/commit/d62eb21375427b25b87490cedd833ce4f6cd0371

gulp.task('closure6', ['build'], function() {

  return gulp.src('src/pbar.js')

    .pipe(closure( {
      compilerPath: 'node_modules/closure-compiler/node_modules/google-closure-compiler/compiler.jar',
      compilerFlags: {'language_in':'ECMASCRIPT6'},
      fileName: 'pbar.es6.min.js'
    } ))

    .pipe(gulp.dest('./dist'));

});





gulp.task('make-dirs', ['clean'], function(done) {

  for (var key in dirs) {
    try      { fs.mkdirSync('.' + path.sep + path.normalize(dirs[key])); }
    catch(e) { if (e.code !== 'EEXIST') { console.log('caught ' + JSON.stringify(e) + ' while making dirs'); } }
  }

  done();

});





gulp.task('doc', ['build'], function() {

  return gulp.src('./src')
    .pipe(esdoc({ destination: './doc' }));

});





gulp.task('setup', ['make-dirs']);





gulp.task('build', ['browserify'], function() {

  return gulp.src(['src/pbar.js'])
    .pipe(gulp.dest('./dist'));

});





gulp.task('default', ['closure5', /* 'closure6', */ 'build', 'doc']);
