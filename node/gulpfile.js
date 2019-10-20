const gulp = require('gulp');
const sass = require('gulp-sass');
const postCss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const flexBugsFixes = require('postcss-flexbugs-fixes');
const cssWring = require('csswring');

const autoprefixerOption = {
    grid: true
};

const postCssOption = [
    flexBugsFixes
    , autoprefixer(autoprefixerOption)
    , cssWring
];

gulp.task('sass', () => {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass())
        .pipe(postCss(postCssOption))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('watch', () => {
    return gulp.watch('./src/sass/**/*.scss', gulp.series('sass'));
});
