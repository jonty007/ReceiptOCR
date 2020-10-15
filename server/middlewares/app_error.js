const { logger } = require('../app/app.logger');

module.exports = (err, req, res, next) => {
  logger.error(`\n [${req.originalMethod}]:${req.originalUrl} \n ${err.stack}`);
  // logger.error(err.stack);

  // If response status code is not set
  res.statusCode === 200 && res.status(err.statusCode || 500);
  return res.send({ message: err.message || 'Something went wrong!' });
};
