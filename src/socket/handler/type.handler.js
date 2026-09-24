const {
  get_other_users_id,
  check_conversation,
  get_conversation_by_id,
  check_conversation_member,
} = require("../../repositories/conversation.repositories");
const relations_repository = require("../../repositories/relations.repositories");
const is_typing = (socket) => {
  socket.on("typing", async (data) => {
    const user_id = socket.user_id;
    const conversation_id = data.conversation_id;

    const conversation = await get_conversation_by_id(conversation_id)
    const other_users_id = await get_other_users_id(
      data.conversation_id,
      user_id,
    );
    if (conversation.type === "direct") {
      const check_block = await relations_repository.check_block(
        user_id,
        other_users_id[0].user_id,
      );
      if (check_block.is_blocked) return;
    }
    for (let user of other_users_id) {
      socket.to(`user-${user.user_id}`).emit("typing", {
        conversation_id: data.conversation_id,
        is_typing: data.is_typing,
        user_typing: user_id,
      });
    }
  });
};
module.exports = { is_typing };
