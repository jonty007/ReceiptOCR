const { io } = require('../../boundaries/socket'),
  { checkConnection, DealConversation } = require('../../db'),
  { logger } = require('../../app/app.logger'),
  { decodeJWT } = require('../../common/auth.utils');

/*  Not needed if redis pub sub is used an setMaxListeners is set to 0
    Overrides possible memory leak warning!

    io.sockets.setMaxListeners(0);
    io.setMaxListeners(0);
   */

// Socket auth middleware
io.use(async (socket, next) => {
  const bearerToken = socket.handshake.query.token;
  if (!bearerToken) {
    return next(new Error('Please make sure your request has an Authorization header!'));
  }

  let payload;
  try {
    payload = await decodeJWT({ token: bearerToken });
  } catch (e) {
    if (e.message === 'Token expired') {
      return next(new Error('Token has expired!'));
    }
    return next(new Error('Invalid Token!'));
  }

  if (!payload || !payload.user) {
    return next(new Error('Invalid Token!'));
  }
  // eslint-disable-next-line require-atomic-updates
  socket.user_id = payload.user.id;
  return next();
});

const addRoom = async id => {
    logger.debug(`Added a room ${id}`);

    io.of(`/${id}`).on('connection', socket => {
      logger.debug('room connected');
      socket.on('disconnect', () => {
        logger.debug('room disconnected');
      });
    });
    // .setMaxListeners(0);
  },
  createRooms = async () => {
    const deal_conversations = await DealConversation.findAll();
    logger.debug('Adding rooms!');

    deal_conversations.forEach(d_conv => {
      addRoom(d_conv.id);
    });
  },
  setup = async () => {
    await createRooms();

    io.on('connection', socket => {
      logger.debug('main socket connected');
      socket.on('disconnect', () => {
        logger.debug('main socket disconnected');
      });
    });
    // .setMaxListeners(0);
  },
  sendSocketMessage = (room, message) => {
    io.of(`/${room}`).emit('message', message);
  },
  sendSocketLeaveRoomMessage = (room, user_id) => {
    io.of(`/${room}`).emit('leave_room', user_id);
  };

checkConnection().then(() => {
  setup();
});

module.exports = {
  addRoom,
  sendSocketMessage,
  sendSocketLeaveRoomMessage
};
