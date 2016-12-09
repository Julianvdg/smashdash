// Plugins
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleancss = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    browserSync = require('browser-sync').create();

// Scripts
gulp.task('scripts', function () {
    return gulp.src([
        'src/scripts/*.js',
    ])
        .pipe(concat('custom.js'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(browserSync.stream())
        .pipe(gulp.dest('dist/scripts'))
        .pipe(notify({message: 'Scripts task complete'}));
});

// Styles
gulp.task('styles', function () {
    sass('src/styles/custom.scss', {style: 'expanded',})
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('dist/styles'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cleancss())
        .pipe(browserSync.stream())
        .pipe(gulp.dest('dist/styles'))
        .pipe(notify({message: 'Styles task complete'}));
});

// Images
gulp.task('images', function () {
    return gulp.src('src/images/**/*')
        .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
        .pipe(browserSync.stream())
        .pipe(gulp.dest('dist/images'))
        .pipe(notify({message: 'Images task complete'}));
});

// Brower Sync
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: './'
        },
        startPath: './dist/index.html'
    });
});

// Watch
gulp.task('watch', function () {
    // Watch .html files
    gulp.watch('dist/*.html', browserSync.reload);
    // Watch .js files
    gulp.watch('src/scripts/*.js', ['scripts']);
    // Watch .scss files
    gulp.watch('src/styles/*.scss', ['styles']);
    // Watch image files
    gulp.watch('src/images/**/*', ['images']);
});

// Default Task
gulp.task('default', ['browser-sync', 'watch']);
