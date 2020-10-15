const exec = require('child_process').exec;

function resetDB() {
  const child = exec(
    'node_modules/.bin/sequelize db:drop && node_modules/.bin/sequelize db:create && node_modules/.bin/sequelize db:migrate'
  );

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.on('close', code => {
    console.log(`Completed with code: `, code);
  });
}

if (process.env.NODE_ENV !== 'production') {
  resetDB();
} else {
  console.error('Failed: Command not allowed in production!');
}
