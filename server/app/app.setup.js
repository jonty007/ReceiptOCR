import express from 'express';
import config from '../config';
import appMiddlewares from './app.middlewares';
import appAddons from './app.addons';
import appRoutes from './app.routes';
import appCrons from './app.crons';
import { logger } from './app.logger';
import { Server } from 'http';
const appErrorMiddleware = require('../middlewares/app_error');

// Initialize a server and create a express app
export function createApp() {
  logger.info('Creating express server...');

  const app = express(),
    http_server = Server(app);

  /* Configures express middlewares, addons, routes */
  appMiddlewares(app);
  appRoutes(app);
  appAddons(http_server, config);
  appCrons();

  /* Catch all errors sent through next(err) */
  app.use(appErrorMiddleware);

  return { app, http_server };
}

// TODO
// app.on('uncaughtException', function(req, res, route, error) {
//   logger.debug('uncaughtException, error');
//   logger.debug(route, error);
//   res.send(500);
// });
