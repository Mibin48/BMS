const socketIO = require('socket.io');

let io;
const users = new Map(); // user_id -> [socket_ids]

module.exports = {
  init: (server) => {
    io = socketIO(server, {
      cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      const { user_id } = socket.handshake.query;

      if (user_id) {
        if (!users.has(user_id)) {
          users.set(user_id, new Set());
        }
        users.get(user_id).add(socket.id);
        socket.join(`user:${user_id}`);
        console.log(`[Socket] User ${user_id} connected. Socket: ${socket.id}`);
      }

      socket.on('disconnect', () => {
        if (user_id && users.has(user_id)) {
          users.get(user_id).delete(socket.id);
          if (users.get(user_id).size === 0) {
            users.delete(user_id);
          }
        }
        console.log(`[Socket] Disconnected: ${socket.id}`);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  sendToUser: (user_id, event, data) => {
    if (io) {
      io.to(`user:${user_id}`).emit(event, data);
    }
  }
};
