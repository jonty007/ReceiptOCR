'use strict';

import { logger } from '../app/app.logger';

const Stripe = require('stripe');

let config;

const init = function(conf) {
  if (conf != null) {
    config = conf;
    exports.client = Stripe(config);
  } else {
    logger.error('Stripe configuration not found');
  }
};

export { init };
