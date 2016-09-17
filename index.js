var Metalsmith      = require('metalsmith');
var commandLineArgs = require('command-line-args')
var browserSync     = require('metalsmith-browser-sync');
var markdown        = require('metalsmith-markdown');
var layouts         = require('metalsmith-layouts');
var permalinks      = require('metalsmith-permalinks');
var s3              = require('metalsmith-s3');
var fingerprint     = require('metalsmith-fingerprint-ignore');
var inplace         = require('metalsmith-in-place');
var autoprefixer    = require('metalsmith-autoprefixer');
var less            = require('metalsmith-less');
var uglify          = require('metalsmith-uglify');
var babel           = require('metalsmith-babel');
var gzip = require('metalsmith-gzip');

const optionDefinitions = [
  { name: 'preview', alias: 'p', type: Boolean },
  { name: 'deploy', alias: 'd', type: Boolean },
]

var options = commandLineArgs(optionDefinitions);

const babelOptions = {
  presets: ['es2015']
};

metalsmith = Metalsmith(__dirname)

if (options.preview) {
  metalsmith
    .use(browserSync({files: ["src/**/*.md", "src/**/*.hbs", "src/**/*.less", "src/**/*.js"]}))
}

metalsmith
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
  .use(less())
  .use(autoprefixer())
  .use(permalinks())
  .use(fingerprint({ pattern: 'posts/*.html' }))
  .use(uglify())
  .use(layouts({
    engine: 'handlebars'
  }))
  .use(inplace({
    engine: 'handlebars'
  }))

if (options.deploy) {
  metalsmith
    .use(gzip({overwrite: true}))
}

metalsmith
  .build(function(err, files) {
    if (err) {
      throw err;
    } else {
      if (options.deploy) {
        console.log("Deploying to s3...")
        var exec = require('child_process').exec;
        var cmd = 's3-website deploy build/';

        exec(cmd, function(error, stdout, stderr) {
          if (error) {
            console.log(error)
          } else {
            console.log(stdout);
            console.log(stderr);
            console.log('Deployed to s3 successfully.')
          }
        });
      }
    }
  });

