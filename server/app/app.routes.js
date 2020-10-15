import express, { Router } from 'express';
const path = require('path');
import { apidoc, client, clientBundle } from '../config';
const v1router = Router();

export default function(app) {
  /* NOTE: Requiring the controller inside this function helps with destructring models for use in controllers
    example:
      const { User } = require('../../../db');
    instead of
      const models = require('../../../db');
      models.User
  */

  app.use('/api/v1', v1router);
  v1router.use(require('../v1/auth/auth.controller').default);
  v1router.use(require('../v1/file/file.controller').default);
  v1router.use(require('../v1/notification_device/notification_device.controller').default);
  v1router.use(require('../v1/organization/organization.controller').default);
  v1router.use(require('../v1/payment/payment.controller').default);
  v1router.use(require('../v1/subscription_plans/subscription_plans.controller').default);
  v1router.use(require('../v1/users/users.controller').default);
  v1router.use(require('../v1/ocr/ocr.controller').default);

  /* Matches in client dist folder for any unmatched routes */
  if (apidoc === true) {
    app.use('/apidoc', express.static(path.join(__dirname, '../dist/apidoc')));
  }
  if (client === true) {
    app.use(express.static(path.join(__dirname, clientBundle.path)));
    app.get('/client/*', function(req, res) {
      res.sendFile(path.join(__dirname, clientBundle.path, clientBundle.fileName));
    });
  }
  // if (admin === true) {
  //   admin_app.get('/v1/status', (req, res, next) => {
  //     res.send({ message: 'Server is up and running' });
  //   });

  //   admin_app.get(
  //     /(?!v|auth|socket.io).*/,
  //     serveStatic('../../dist', {
  //       index: 'admin/index.html'
  //     })
  //   );
  // }
}
