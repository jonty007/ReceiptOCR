import './app/app.overrides'; // Bunch of javascript prototype overrides
import { addPath } from 'app-module-path';
// import { database } from './config';
import { logger } from './app/app.logger';
import { createApp } from './app/app.setup';
// Disabled eslint for db import because of requiring to export default in db/index.js which causes issues in importing models in controllers.
/* eslint-disable-next-line */
import db from "./db";

addPath(__dirname);

const config = require('./config');

db.init(config.database);

/* Make sure db.init is called before createApp */

const { app, http_server } = createApp();

/* Verify db connection async */
db.checkConnection()
  .then(() => {
    logger.info('Connected to the database');
  })
  .catch(() => {
    logger.error('Unable to connect to the database');
    process.exit(1);
  });

export { app, http_server };

/*
  NOTE: app listen is through .bin/pm2 and .bin/server
*/
