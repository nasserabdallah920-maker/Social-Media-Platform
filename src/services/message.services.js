const {
  get_other_users_id,
  check_conversation_member,
  check_conversation,
  get_conversation_by_id,
  create_conversation,
} = require("../repositories/conversation.repositories");
const {
  save_message,
  update_seen_message,
  get_messages_by_conversation_id,
  update_message_details,
  delete_message_by_id,
  get_message_by_id,
  update_delivered_message,
} = require("../repositories/message.repositories");
const { get_io } = require("../socket/socketManager");
const AppError = require("../utils/apperror");
const { status_code, status } = require("../utils/status");
const conversation_services = require("./conversation.services");
const { verify_user_blocking } = require("../utils/checkBlock");

const add_new_message = async (
  sender_id,
  to_user_id,
  type,
  conversation_id,
  text,
  file = null,
) => {

  let current_conversation_id = conversation_id;
  const conversation = conversation_id
    ? await get_conversation_by_id(conversation_id)
    : null;
  if (!conversation && type === "group") {
    throw new AppError(
      "The group must be created first.",
      status_code.BAD_REQUEST,
    );
  }
  if (!conversation && type === "direct") {
    await verify_user_blocking(to_user_id, sender_id);
    current_conversation_id = await create_conversation("direct", [
      sender_id,
      to_user_id,
    ]);
  }
  const is_user_in_conversation = await check_conversation_member(
    sender_id,
    current_conversation_id,
  );
  if (!is_user_in_conversation) {
    throw new AppError(
      "You are not in this conversation",
      status_code.FORBIDDEN,
    );
  }
  if (!text && !file) {
    throw new AppError(
      "Message must have text or file.",
      status_code.BAD_REQUEST,
    );
  }
  const file_url = file ? `/uploads/${file.filename}` : null;

  const message_id = await save_message(
    sender_id,
    text,
    current_conversation_id,
    file_url,
  );
  const other_users_id = await get_other_users_id(
    current_conversation_id,
    sender_id,
  );
  const io = get_io();
  for (let user of other_users_id) {
    io.to(`user-${user.user_id}`).emit("new-message", {
      text,
      sender_id,
      conversation_id: current_conversation_id,
      file_url,
      sent_at: Date.now(),
      message_id,
    });
  }
  return {
    message_id,
    sender_id,
    file_url,
    text,
    conversation_id: current_conversation_id,
  };
};

const set_message_seen = async (conversation_id, user_id) => {
  const save = await update_seen_message(conversation_id, user_id);
  return;
};
const set_message_delivered = async (conversation_id, user_id) => {
  const save = await update_delivered_message(conversation_id, user_id);
  return;
};

const get_conversation_messages = async (
  user_id,
  conversation_id,
  limit,
  offset,
) => {
    if(limit<10 || limit>100){
    throw new AppError('The limit must be at least 10 or at most 100.',status_code.BAD_REQUEST)
  }
  const check = await check_conversation_member(user_id, conversation_id);
  if (!check) {
    throw new AppError(
      "You do not have permission to access this chat.",
      status_code.UNAUTHORIZED,
    );
  }
  const messages = await get_messages_by_conversation_id(
    conversation_id,
    limit,
    offset,
  );
  return messages;
};

const edit_message = async (message_id, text, user_id) => {
  await update_message_details(message_id, text, user_id);
  const updated_message = await get_message_by_id(message_id);
  if (updated_message) {
    const other_users_id = await get_other_users_id(
      updated_message.conversation_id,
      user_id,
    );
    const io = get_io();
    for (let user of other_users_id) {
      io.to(`user-${user.user_id}`).emit("message-edit", {
        conversation_id: updated_message.conversation_id,
        user_id,
        message: updated_message,
      });
    }
  }
  return updated_message;
};

const remove_message = async (message_id, conversation_id, user_id) => {
  await delete_message_by_id(message_id, user_id);
  const other_users_id = await get_other_users_id(
    conversation_id,
    user_id,
  );
  const io = get_io();
  for (let user of other_users_id) {
    io.to(`user-${user.user_id}`).emit("message-delete", {
      conversation_id: conversation_id,
      user_id,
      message_id: message_id,
    });
  }
  return;
};

module.exports = {
  add_new_message,
  set_message_seen,
  get_conversation_messages,
  edit_message,
  remove_message,
  set_message_delivered,
};
