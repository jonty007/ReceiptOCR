const { app, http_server } = require('../server');
const { logger } = require('../app/app.logger');
const { port, name: app_name } = require('../config');

http_server.listen(port, '::', () => logger.info(`${app_name} listening at ${port}`));

module.exports = {
  app,
  http_server
};
