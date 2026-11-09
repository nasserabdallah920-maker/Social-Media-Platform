const {
  check_conversation,
} = require("../repositories/conversation.repositories");
const conversation_services = require("../services/conversation.services");
const message_services = require("../services/message.services");
const AppError = require("../utils/apperror");
const { status_code, status } = require("../utils/status");

const get_conversation_messages = async (req, res, next) => {
  const conversation_id = req.params.conversation_id;
  const user_id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const result = await message_services.get_conversation_messages(
    user_id,
    conversation_id,
    limit,
    offset,
  );
  const nextPage = result.length < limit ? null : page + 1;
  res.status(status_code.OK).json({ success: status.SUCCESS, data: result, nextPage });
};

const new_message = async (req, res, next) => {
  const file = req.file;
  const user_id = req.user.id;

  const { to_user_id, conversation_type, text } = req.body;
  const conversation_id = req.params.conversation_id;

  const result = await message_services.add_new_message(
    user_id,
    to_user_id,
    conversation_type,
    conversation_id,
    text,
    file,
  );
  res.status(status_code.OK).json({ success: status.SUCCESS, data: result });
};

const update_message = async (req, res, next) => {
  const message_id = req.params.message_id;
  const user_id = req.user.id || req.user.user_id;
  const { text } = req.body;
  const result = await message_services.edit_message(message_id, text, user_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, data: result });
};

const delete_message = async (req, res, next) => {
  const { message_id, conversation_id } = req.params;
  const user_id = req.user.id;
  await message_services.remove_message(message_id, conversation_id, user_id);
  res.status(status_code.NO_CONTENT).send();
};

const get_unread_messages_count = async (req, res, next) => {
  const user_id = req.user.id;
  const count = await message_services.get_unread_messages_count(user_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, data: { count } });
};

module.exports = {
  get_conversation_messages,
  update_message,
  delete_message,
  new_message,
  get_unread_messages_count,
};