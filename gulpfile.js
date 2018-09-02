const gulp      = require('gulp'),
	plumber     = require('gulp-plumber'),
	gstylus     = require('gulp-stylus'),
	uglify      = require('gulp-uglify'),
	concat      = require('gulp-concat'),
	gimagemin   = require('gulp-imagemin'),
	server      = require('browser-sync'),
    // stylus
	jeet        = require('jeet'),
	rupture     = require('rupture'),
	koutoSwiss  = require('kouto-swiss'),
	prefixer    = require('autoprefixer-stylus'),
	cp          = require('child_process');

var messages = {
	jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build',
    stylus: '<span style="color: grey">Running:</span> $ stylus',
    imagemin: '<span style="color: grey">Running:</span> $ imagemin'
};

var jekyllCommand = (/^win/.test(process.platform)) ? 'jekyll.bat' : 'jekyll';

function serve(done) {
    server.init({
        server: {
            baseDir: '_site'
        },
        files: ['_site/']
    });
    done();
}
gulp.task('serve', serve);
/**
 * Build the Jekyll Site
 */
function jekyll_build() {
	server.notify(messages.jekyllBuild);
	return cp.spawn(jekyllCommand, ['build', '--drafts'], {stdio: 'inherit'});
}
gulp.task('jekyll-build', jekyll_build);

/**
 * Stylus task
 */
function stylus(){
	server.notify(messages.stylus);
    return gulp.src('src/styl/main.styl')
        .pipe(plumber())
		.pipe(gstylus({
			use:[koutoSwiss(), prefixer(), jeet(), rupture()],
			compress: true
        }))
        .pipe(gulp.dest('assets/css'))
		.pipe(gulp.dest('_site/assets/css/'));
}
gulp.task('stylus', stylus);

/**
 * Javascript Task
 */
function js(){
	return gulp.src('src/js/**/*.js')
		.pipe(plumber())
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest('assets/js/'))
		.pipe(gulp.dest('_site/assets/js/'));
}
gulp.task('js', js);

/**
 * Imagemin Task
 */
function imagemin() {
    server.notify(messages.imagemin)
	return gulp.src('src/img/**/*.{jpg,png,gif}')
		.pipe(plumber())
		.pipe(gimagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
		.pipe(gulp.dest('assets/img/'))
		.pipe(gulp.dest('_site/assets/img/'));
}
gulp.task('imagemin', imagemin);

/**
 */
gulp.task('watch', function () {
	gulp.watch('src/styl/**/*.styl', gulp.series('stylus'));
	gulp.watch('src/js/**/*.js', gulp.series('js'));
	gulp.watch('src/img/**/*.{jpg,png,gif}', imagemin);
	gulp.watch([
        '_config.yml',
        '*.html',
        '_includes/*.html',
        '_layouts/*.html',
        '_posts/*',
        '_drafts/*'
    ], gulp.series('jekyll-build'));
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', gulp.series(
    gulp.parallel(
        'js',
        'stylus',
        'imagemin',
        'jekyll-build'
    ),
    gulp.parallel(
        'serve',
        'watch'
    )
));

