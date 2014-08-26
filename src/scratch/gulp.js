
// not actually sure how to push these up to the owning project yet
// putting them in because i wanted to check some stuff and couldn't because it wasn't in the repo
// but this is not where these will live in the long term

global.errorMessage = '';

var gulp      = require('gulp'),
    clean     = require('gulp-clean'),
    yuidoc    = require('gulp-yuidoc'),
    gulpkss   = require('gulp-kss'),
    react     = require('gulp-react'),
    less      = require('gulp-less'),
    path      = require('path'),
    glue      = require('gulp-sprite-glue'),
    uglify    = require('gulp-uglifyjs'),
    minifyCSS = require('gulp-minify-css'),
    sloc      = require('gulp-sloc');

gulp.task('clean', function() {
  return gulp.src(['./build','./dist','./assets/styleguide'], {read: false}).pipe(clean());
});

gulp.task('prep', ['clean','sprite-glue']);

gulp.task('sprite-glue', ['clean'], function() {
  gulp.src('./assets/img/**/*')
    .pipe(glue('./dist/img', {}));
});

gulp.task('react', ['prep'], function () {
  return gulp.src('./assets/controls/*.jsx')
    .pipe(react())
    .pipe(gulp.dest('./build/react-js'));
});

gulp.task('less', ['prep'], function () {
  gulp.src('./assets/less/**/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./build/css'));
});

gulp.task('minify-css', ['less','sprite-glue','prep'], function() {
  gulp.src('./build/css/*.css')
    .pipe(minifyCSS())
    .pipe(gulp.dest('./dist'));
});

gulp.task('uglify-js', ['react'], function() {
  gulp.src(['./build/react-js/*.js','./assets/js/**/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

gulp.task('yuidoc', ['prep'], function() {
  gulp.src("./assets/js/**/*.js")
    .pipe(yuidoc())
    .pipe(gulp.dest("./doc/js"));
});

gulp.task('living-style-guide', ['prep'], function() {
  gulp.src(['./assets/less/**/*.less'])
    .pipe(gulpkss({
        overview: __dirname + '/styleguide.md'
    }))
    .pipe(gulp.dest('./doc/styleguide/css/'));
});

gulp.task('build',  ['react','less','minify-css']);
gulp.task('doc',    ['living-style-guide','yuidoc']);
gulp.task('minify', ['uglify-js']);

gulp.task('sloc', ['build'], function(){
  gulp.src(['./build/react-js/*.js','./assets/js/**/*.js'])
    .pipe(sloc());
});

gulp.task('default', ['build','minify','doc','sloc']);
