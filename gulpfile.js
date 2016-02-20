const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const del = require('del');
const autoprefixer = require('gulp-autoprefixer');
const minifycss = require('gulp-minify-css');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const babel = require('gulp-babel');

gulp.task('clean', cb => {
    del(['build'], cb);
});

gulp.task('browser-sync', () => {
    browserSync.init({
        server: './'
    });
});

gulp.task('scripts', () => {
    return gulp.src('src/js/*')
        .pipe(babel({
            presets: ['es2015'],
        }))
        .pipe(uglify())
        .pipe(gulp.dest('build/js/'))
        .pipe(browserSync.stream());
});

gulp.task('styles', () => {
    return gulp.src('src/scss/*')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('build/css/'))
        .pipe(browserSync.stream());
});

gulp.task('watch', () => {
    gulp.watch('src/js/**/*', ['scripts']);
    gulp.watch('src/scss/**/*', ['styles']);
    gulp.watch('index.html', reload);
});

gulp.task('default', ['watch', 'scripts', 'styles', 'browser-sync']);