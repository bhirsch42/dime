var Metalsmith   = require('metalsmith');
var browserSync  = require('metalsmith-browser-sync');
var markdown     = require('metalsmith-markdown');
var layouts      = require('metalsmith-layouts');
var permalinks   = require('metalsmith-permalinks');
var s3           = require('metalsmith-s3');
var fingerprint  = require('metalsmith-fingerprint-ignore');
var inplace      = require('metalsmith-in-place');
var autoprefixer = require('metalsmith-autoprefixer');
var less         = require('metalsmith-less');
var uglify       = require('metalsmith-uglify');
var babel        = require('metalsmith-babel');

const babelOptions = {
  presets: ['es2015']
};

Metalsmith(__dirname)
  .use(browserSync({files: ["src/**/*.md", "src/**/*.hbs", "src/**/*.less", "src/**/*.js"]}))
  .metadata({
    title: "My Static Site & Blog",
    description: "It's about saying »Hello« to the World.",
    generator: "Metalsmith",
    url: "http://www.metalsmith.io/"
  })
  .source('./src')
  .destination('./build')
  .clean(true)
  .use(markdown())
  .use(babel(babelOptions))
  // .use(uglify())
  .use(less())
  .use(autoprefixer())
  // .use(permalinks())
  .use(fingerprint({ pattern: 'posts/*.html' }))
  .use(layouts({
    engine: 'handlebars'
  }))
  .use(inplace({
    engine: 'handlebars'
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  });

