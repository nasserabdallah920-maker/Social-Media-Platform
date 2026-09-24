const {
  get_other_users_id,
} = require("../../repositories/conversation.repositories");

const {
  set_message_seen,
  set_message_delivered,
} = require("../../services/message.services");
const relations_repository = require("../../repositories/relations.repositories");

const receive_message = (socket) => {
  const user_id = socket.user_id;
  socket.on("message-delivered", async (data) => {
    try {
      const conversation_id = data.conversation_id;
      const conversation_type = data.conversation_type;
      const other_users_id = await get_other_users_id(conversation_id, user_id);
      if (conversation_type === "direct") {
        const check_block = await relations_repository.check_block(
          user_id,
          other_users_id[0].user_id,
        );
        if (check_block.is_blocked) return;
      }
      await set_message_delivered(conversation_id, user_id);
      for (let user of other_users_id) {
        socket.to(`user-${user.user_id}`).emit("message-status", {
          conversation_id,
          status: "message received",
          user_id,
        });
      }
    } catch (error) {
      console.error("Message delivered error:", error);
    }
  });
};
const seen_message = (socket) => {
  const user_id = socket.user_id;
  socket.on("message-seen", async (data) => {
    const conversation_id = data.conversation_id;
    const conversation_type = data.conversation_type;
    const other_users_id = await get_other_users_id(
      conversation_id,
      user_id,
    );
    if (conversation_type === "direct") {
      const check_block = await relations_repository.check_block(
        user_id,
        other_users_id[0].user_id,
      );

      if (check_block.is_blocked) return;
    }

    await set_message_seen(conversation_id, user_id);
    for (let user of other_users_id) {
      socket.to(`user-${user.user_id}`).emit("message-status", {
        conversation_id,
        status: "message seen",
        user_id,
      });
    }
  });
};

module.exports = { seen_message, receive_message };
