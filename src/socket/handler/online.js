const {
  get_followers_without_limit,
  get_following_without_limit,
} = require("../../repositories/relations.repositories");

const set_user_status = async (user_id, io, is_online) => {
  const followers = await get_followers_without_limit(user_id);
  for (let follower of followers) {
    if (io.sockets.adapter.rooms.has(`user-${follower.id}`)) {
      io.to(`user-${follower.id}`).emit("online-user", {
        user_id,
        is_online,
      });
    }
  }
  return;
};

const user_following_handler = async (user_id, socket, io) => {
  const following = await get_following_without_limit(user_id);
  const following_online = []
  for (const user of following) {
    if (io.sockets.adapter.rooms.has(`user-${user.id}`)) {
      following_online.push({
        user_id: user.id,
        is_online: true,
      });
    }
  }
  socket.emit("online-users", following_online);
};

module.exports = { set_user_status, user_following_handler };
