const { Server } = require("socket.io");
const { socket_auth } = require("../middlewares/socketAuth.middleware");
const { seen_message, receive_message } = require("./handler/messageStatus");
const {
  user_status_handler,
  set_user_status,
  user_following_handler,
} = require("./handler/online");
const { is_typing } = require("./handler/type.handler");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      credentials: true,
      origin: process.env.SOCKET_ORIGIN || process.env.CLIENT_URL,
      methods:["GET", "POST"]
    },
  });

  io.use(socket_auth);
  io.on("connection", async (socket) => {

    const user_id = socket.user_id;
    const room = `user-${user_id}`;
    socket.join(room);
    await set_user_status(user_id, io, true);
    user_following_handler(user_id, socket, io);
    seen_message(socket);
    receive_message(socket);
    is_typing(socket);

    socket.on("disconnect", () => {
      set_user_status(user_id, io, false);
    });
    socket.on("connect_error", (err) => {
      return next(new Error(err.message));
    });
  });
  return io;
};
