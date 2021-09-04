let project_folder = require("path").basename(__dirname);
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
    js: source_folder + "/js/main.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source_folder + "/fonts/*.ttf"
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}"
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
  tinypng = require("gulp-tinypng"),
  cache = require('gulp-cache'),
  webp = require('gulp-webp'),
  webphtml = require('gulp-webp-html'),
  webpcss = require('gulp-webpcss'),
  stripComments = require('gulp-strip-comments');

  const browserSync = () => {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
}

const html = () => {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

const images = () => {
  return src(path.src.img)
    .pipe(
      webp({
          quality: 75
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))

    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

const js = () => {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    // .pipe(
    //   babel({
    //     presets: ['@babel/env']
    //   })
    // )
    .pipe(
      uglify()
    )
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

const css = () => {
  return src(path.src.css)
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
    .pipe(
      webpcss({
        webpClass: '.webp',
        noWebpClass: '.no-webp'
      })
    )
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

// Watch

const watchFiles = () => {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.img], images)
}

const clean = () => {
  return del(path.clean);
}

exports.default = gulp.series(
  clean,
  gulp.parallel(css, js, html, images),
  gulp.parallel(watchFiles, browserSync)
)
