let io;
const set_io = (io_socket) => {
  io = io_socket;
};
const get_io = () => {
  return io;
};
module.exports = { set_io, get_io };
