/* eslint-disable one-var */
/* eslint-disable no-var */
var syntax = "sass"; // Syntax: sass or scss;

var gulp = require("gulp"),
  gutil = require("gulp-util"),
  sass = require("gulp-sass"),
  browserSync = require("browser-sync"),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglify"),
  cleancss = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  autoprefixer = require("gulp-autoprefixer"),
  notify = require("gulp-notify"),
  rsync = require("gulp-rsync");

gulp.task("browser-sync", function() {
  browserSync({
    server: {
      baseDir: "app"
    },
    notify: false
    // open: false,
    // online: false, // Work Offline Without Internet Connection
    // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
  });
});

gulp.task("styles", function() {
  return gulp
    .src("src/" + syntax + "/**/*." + syntax + "")
    .pipe(sass({ outputStyle: "expand" }).on("error", notify.onError()))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(autoprefixer(["last 15 versions"]))
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
    .pipe(gulp.dest("src/css"))
    .pipe(browserSync.stream());
});

gulp.task("js", function() {
  return (
    gulp
      .src([
        // 'app/libs/jquery/dist/jquery.min.js',
        "src/libs/magnific/jquery.magnific-popup.min.js",
        "src/libs/datapicker/datapicker.js",
        "src/libs/chart/chart.js",
        "src/libs/chart/chart.bundle.js",
        "src/libs/jquery-custom-select-master/dist/js/jquery.custom-select.min.js",
        "src/js/common.js" // Always at the end
      ])
      .pipe(concat("scripts.min.js"))
      // .pipe(uglify()) // Mifify js (opt.)
      .pipe(gulp.dest("src/js"))
      .pipe(browserSync.reload({ stream: true }))
  );
});

gulp.task("rsync", function() {
  return gulp.src("app/**").pipe(
    rsync({
      root: "app/",
      hostname: "username@yousite.com",
      destination: "yousite/public_html/",
      // include: ['*.htaccess'], // Includes files to deploy
      exclude: ["**/Thumbs.db", "**/*.DS_Store"], // Excludes files from deploy
      recursive: true,
      archive: true,
      silent: false,
      compress: true
    })
  );
});

gulp.task("watch", ["styles", "js", "browser-sync"], function() {
  gulp.watch("src/" + syntax + "/**/*." + syntax + "", ["styles"]);
  gulp.watch(["src/**/*.js", "app/js/common.js"], ["js"]);
  gulp.watch("app/*.html", browserSync.reload);
});

gulp.task("default", ["watch"]);
