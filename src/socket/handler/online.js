const {
  get_followers_without_limit,
  get_following_without_limit,
} = require("../../repositories/relations.repositories");
const { find_profile_by_user_id } = require("../../repositories/profile.repositories");

const set_user_status = async (user_id, io, is_online) => {
  const followers = await get_followers_without_limit(user_id);
  
  let user_data = null;
  if (followers.length > 0) {
    const profile = await find_profile_by_user_id(user_id);
    user_data = {
      id: user_id,
      user_id,
      user_name: profile?.user_name || null,
      username: profile?.user_name || null,
      avatar: profile?.avatar || null,
      is_online,
    };
  }

  for (let follower of followers) {
    if (io.sockets.adapter.rooms.has(`user-${follower.id}`)) {
      io.to(`user-${follower.id}`).emit("online-user", user_data);
    }
  }
  return;
};

const user_following_handler = (user_id, socket, io) => {
  socket.on("get-online-users", async () => {
    const following = await get_following_without_limit(user_id);
    const following_online = [];
    for (const user of following) {
      if (io.sockets.adapter.rooms.has(`user-${user.id}`)) {
        following_online.push({
          id: user.id,
          user_id: user.id,
          user_name: user.user_name,
          username: user.user_name,
          avatar: user.avatar,
          is_online: true,
        });
      }
    }
    socket.emit("online-users", following_online);
  });
};

module.exports = { set_user_status, user_following_handler };
