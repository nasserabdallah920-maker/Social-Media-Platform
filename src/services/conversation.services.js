const {
  create_conversation,
  check_conversation,
  get_user_conversations: get_user_conversations_repo,
  delete_conversation_by_id,
  check_conversation_member,
} = require("../repositories/conversation.repositories");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");

const add_conversation = async (users_id, type) => {
  let conversation_id;
  if (!type) {
    const results = await check_conversation(...users_id);
    const existing = results[0];
    conversation_id = existing ? existing.id : null;
  }
  if (!conversation_id) {
    if (type === "group") {
      conversation_id = await create_conversation(type, users_id);
    } else {
      conversation_id = await create_conversation("direct", users_id);
    }
  }
  return conversation_id;
};

const get_user_conversations = async (user_id) => {
  const conversations = await get_user_conversations_repo(user_id);
  return conversations;
};

const remove_conversation = async (user_id, conversation_id) => {
  const check_member = await check_conversation_member(
    user_id,
    conversation_id,
  );
  if (!check_member) {
    throw new AppError(
      "You cannot delete this conversation because you are not a member of it.",
      status_code.UNAUTHORIZED,
    );
  }
  await delete_conversation_by_id(conversation_id);
};

module.exports = {
  add_conversation,
  get_user_conversations,
  remove_conversation,
};
