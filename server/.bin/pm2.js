const { spawnSync } = require('child_process');

// Migrate DB and run app

const child = spawnSync('node_modules/.bin/sequelize', ['db:migrate']);
console.log(child.stdout.toString()); // eslint-disable-line

if (child.status !== 0) {
  console.error(new Error('Migration Failed!')); // eslint-disable-line
  console.log(child.stderr.toString()); // eslint-disable-line
  process.exit(0);
}

require('../start');
