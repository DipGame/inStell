const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const htmlclean = require('gulp-htmlclean');
const server = require('gulp-server-livereload');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const webpCSS = require('gulp-webp-css');
const csso = require('gulp-csso');
const clean = require('gulp-clean');
const browserSync = require('browser-sync');
const sourceMaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const webpHTML = require('gulp-webp-html');

const groupMedia = require('gulp-group-css-media-queries');
const fs = require('fs');
const changed = require('gulp-changed');

const fileIncludeSettings = {
    prefix: '@@',
    basepath: '@file'
};

const serverOptions = {
    liveReload: true,
    open: true,
    cache: false
};

function plumberNotify(title) {
    return {
        errorHandler: notify.onError({
            title: title,
            message: 'Error <%= error.message %>',
            sound: false
        })
    }
}

gulp.task('html:docs', function () {
    return gulp
        .src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
        .pipe(changed('./docs/'))
        .pipe(plumber(plumberNotify("HTML")))
        .pipe(fileInclude(fileIncludeSettings))
        // .pipe(webpHTML())
        .pipe(htmlclean())
        .pipe(gulp.dest('./docs/'))
});

gulp.task('sass:docs', function () {
    return gulp
        .src('./src/scss/*.scss')
        .pipe(changed('./docs/css'))
        .pipe(plumber(plumberNotify("SCSS")))
        .pipe(sourceMaps.init())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./docs/css'))
})

gulp.task('fonts:docs', function () {
    return gulp
        .src('./src/fonts/**/*')
        .pipe(changed('./docs/fonts'))
        .pipe(gulp.dest('./docs/fonts'))
})

gulp.task('files:docs', function () {
    return gulp
        .src('./src/files/**/*')
        .pipe(changed('./docs/files'))
        .pipe(gulp.dest('./docs/files'))
})

gulp.task('js:docs', function () {
    return gulp
        .src('./src/js/*.js')
        .pipe(changed('./docs/js'))
        // .pipe(plumber(plumberNotify("JS")))
        // .pipe(babel())
        // .pipe(webpack(require('./../webpack.config.js')))
        .pipe(gulp.dest('./docs/js'))
})

gulp.task('images:docs', function () {
    return gulp
        .src('./src/img/**/*')
        .pipe(changed('./docs/img'))
        // .pipe(webp())
        .pipe(gulp.dest('./docs/img'))

        .pipe(gulp.src('./src/img/**/*'))
        .pipe(imagemin({ verbose: true }))
        .pipe(gulp.dest('./docs/img'));
})

gulp.task('server:docs', function () {
    return gulp
        .src('./docs/')
        .pipe(server(serverOptions))
})

gulp.task('clean:docs', function (done) {
    if (fs.existsSync('./docs/')) {
        return gulp
            .src('./docs/', { read: false })
            .pipe(clean())
    }

    done();
})
