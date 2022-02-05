const settings = {
  externalFolder: false,
  webp: false
}

let project_folder = require("path").basename(__dirname);

if(settings.externalFolder) {
  project_folder = "../built/" + require("path").basename(__dirname);
}

let source_folder = "src";

let path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/"
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    normalize: source_folder + "/scss/normalize.scss",
    js: source_folder + "/js/main.js",
    jquery: source_folder + "/js/jquery.min.js",
    img: source_folder + "/img/**/*.{jpg,png,gif,ico,webp}",
    svg: source_folder + "/img/**/*.svg",
    fonts: source_folder + "/fonts/*"
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,gif,ico,webp}",
    svg: source_folder + "/img/**/*.svg"
  },
  clean: "./" + project_folder + "/"
}

const { src, dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  scss = require('gulp-sass')(require('sass')),
  autoprefixer = require('gulp-autoprefixer'),
  group_media = require('gulp-group-css-media-queries'),
  clean_css = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify-es").default,
  // babel = require("gulp-babel"),
  tinypng = require("gulp-tinypng-compress"),
  cache = require('gulp-cache'),
  webp = require('gulp-webp'),
  webpHTML = require("gulp-xv-webp-html"),
  htmlmin = require("gulp-htmlmin"),
  gulpif = require('gulp-if'),
  sourcemaps = require('gulp-sourcemaps'),
  webpcss = require('gulp-webpcss');

const browserSync = () => {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
}

// HTML
const html = () => {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(gulpif(settings.webp, webpHTML()))
    .pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        removeCommentsFromCDATA: true,
        removeEmptyAttributes: true,
        removeEmptyElements: true,
        collapseBooleanAttributes: true
    }))
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

// IMAGES
const images = () => {
  return src(path.src.img)
    .pipe(cache(
      tinypng({
        key: 'Tyfvd06vy8HYhSff3mDT95zmGDk44M4s',
        sigFile: 'images/.tinypng-sigs',
        log: true
      }))
    )
    .pipe(dest(path.build.img))
    .pipe(gulpif(settings.webp, webp({ quality: 85 })))
    .pipe(dest(path.build.img))
    .pipe(src(path.src.svg))
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

// JS
const js = () => {
  return src(path.src.js)
    .pipe(sourcemaps.init())
    .pipe(fileinclude({
      context: {
        webp: settings.webp
      }
    }))
    // .pipe(
    //   babel({
    //     presets: ['@babel/env']
    //   })
    // )
    .pipe(dest(path.build.js))
    .pipe(
      uglify()
    )
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}
// JS JQUERY
const jsJquery = () => {
  return src(path.src.jquery)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

// CSS
const css = () => {
  return src(path.src.css)
    .pipe(gulpif(settings.webp, webpcss({webpClass: '.webp', noWebpClass: '.no-webp'})))
    .pipe(sourcemaps.init())
    .pipe(
      scss({ 
        outputStyle: 'expanded' 
      }).on('error', scss.logError)
    )
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
    }))
    .pipe(clean_css())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write())
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}
// CSS NORMALIZE
const normalize = () => {
  return src(path.src.normalize)
    .pipe(
      scss({ 
        outputStyle: 'expanded' 
      }).on('error', scss.logError)
    )
    .pipe(clean_css())
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest(path.build.css))
}
const fonts = () => {
  return src(path.src.fonts) 
  .pipe(dest(path.build.fonts))
  .pipe(browsersync.stream())
}

// Watch

const watchFiles = () => {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.img], images)
  gulp.watch([path.watch.svg], images)
}

const clean = () => {
  return del(path.clean, {
    force: true
  });
}

exports.default = gulp.series(
  clean,
  gulp.parallel(css, normalize, js, jsJquery, html, images, fonts),
  gulp.parallel(watchFiles, browserSync)
)
