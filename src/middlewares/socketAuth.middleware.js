const app_error = require("../utils/apperror");
const { verify_access_token } = require("../utils/jwt");

const socket_auth = (socket, next) => {
  const auth_header = socket.handshake.auth.token||socket.handshake.headers.auth;
  const token = auth_header ? auth_header.split(" ")[1] : null;

  if (!token) {
    return next(new Error("token not found"));
  }
  const payload = verify_access_token(token);
  if (!payload) {
    return next(new Error("User not found"));
  }

  socket.user_id = payload.id;
  next();
};

module.exports = { socket_auth };