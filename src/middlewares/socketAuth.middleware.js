
const { verify_access_token } = require("../utils/jwt");

const socket_auth = (socket, next) => {
  const auth_header =
    socket.handshake.auth.token ||
    socket.handshake.headers.auth;

  const token = auth_header
    ? auth_header.startsWith("Bearer ")
      ? auth_header.slice(7)
      : auth_header
    : null;

  if (!token) {
    return next(new Error("Token not found"));
  }

  try {
    const payload = verify_access_token(token);

    socket.user_id = payload.id;
    return next();
  } catch (err) {
    return next(new Error("Invalid or expired token"));
  }
};

module.exports = { socket_auth };
