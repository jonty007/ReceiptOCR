import gulp from 'gulp';
import gutil from 'gulp-util';
import nodemon from 'gulp-nodemon';
import path from 'path';
import yargs from 'yargs';
import request from 'request';
import rename from 'gulp-rename';
import template from 'gulp-template';
import Promise from 'bluebird';

// Set default node environment to local development
process.env.NODE_ENV = process.env.NODE_ENV || 'local';

Promise.promisifyAll(request);

const app = yargs.argv.app || 'client',
  // const build = yargs.argv.build || '0';
  root = app,
  // map of all paths

  // helper method for resolving paths
  resolveToApp = (glob = '') => path.join(root, '/app', glob), // app/{glob}
  resolveToComponents = (glob = '') => {
    if (app === 'common') {
      return path.join(root, '/components', glob); // components/{glob}
    }
    return path.join(root, '/app/components', glob); // app/components/{glob}
  },
  paths = {
    js: resolveToComponents('**/*!(.spec.js).js'), // exclude spec files
    scss: resolveToApp('**/*.scss'), // stylesheets
    html: [resolveToApp('**/*.html'), path.join(root, 'index.html')],
    entry: ['@babel/polyfill', path.join(__dirname, root, '/app/app.js')],
    output: root,
    blankEndpoints: path.join(__dirname, '../', 'generator', '/endpoint/**/*.**'),
    blankEndpoints_v2: path.join(__dirname, '../', 'generator', '/endpoint_v2/**/*.**'),
    git: []
  },
  resolveToEndpoints = (glob = '') => path.join('./v1/', glob), // v1/{glob}
  endpointGenerator = endpoint_path => {
    const cap = val => val.charAt(0).toUpperCase() + val.slice(1),
      { name } = yargs.argv,
      parentPath = yargs.argv.parent || '',
      destPath = path.join(resolveToEndpoints(), parentPath, name);

    return gulp
      .src(endpoint_path)
      .pipe(
        template({
          name: name,
          upCaseName: cap(name)
        })
      )
      .pipe(
        rename(path_ => {
          path_.basename = path_.basename.replace('temp', name);
        })
      )
      .pipe(gulp.dest(destPath));
  };

gulp.task('endpoint', () => endpointGenerator(paths.blankEndpoints));
gulp.task('endpoint_v2', () => endpointGenerator(paths.blankEndpoints_v2));
gulp.task('serve', done => {
  const stream = nodemon({
    script: './start.js',
    execMap: {
      js: 'node --preserve-symlinks'
    },
    ext: 'js,dot',
    watch: ['**/*'],
    ignore: ['node_modules/', 'db/migrations/', 'db/seeders/'],
    done: done
  })
    .on('start', () => {})
    .on('restart', function() {
      gutil.log(gutil.colors.yellow('Restarted!'));
    })
    .on('crash', function(err) {
      gutil.log(gutil.colors.red('App server has crashed!\n'));
      gutil.log(gutil.colors.red(err));
      setTimeout(function() {
        stream.emit('restart'); // restart the server in 10 seconds
      }, 2000);
    });

  done();
});

process.on('SIGINT', function() {
  gutil.log(gutil.colors.red(`Successfully closed ${process.pid}`));
  process.exit(0);
});

gulp.task('default', gulp.series('serve'));
