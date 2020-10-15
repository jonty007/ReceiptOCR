const socketIO = require('socket.io'),
  { logger } = require('../app/app.logger'),
  { redis: redis_config } = require('../config'),
  redis = require('redis'),
  redisAdapter = require('socket.io-redis');

let io;
const init = function(http_server) {
  io = socketIO(http_server);

  const { host, port, password } = redis_config || {};
  if (host && port) {
    const redis_options = { auth_pass: password || '' },
      pub = redis.createClient(port, host, redis_options),
      sub = redis.createClient(port, host, redis_options),
      adapter = redisAdapter({ pubClient: pub, subClient: sub });

    // Overrides possible memory leak warning; MaxListenersExceededWarning
    adapter.pubClient.setMaxListeners(0);
    adapter.subClient.setMaxListeners(0);

    io.adapter(adapter);
    adapter.prototype.on('error', function(err) {
      logger.error(err);
      logger.error('Cannot connect to redis!');
    });
    logger.info('Redis connected!');
  } else {
    logger.error('No redis config detected!');
  }
};

module.exports = {
  init,
  io
};
