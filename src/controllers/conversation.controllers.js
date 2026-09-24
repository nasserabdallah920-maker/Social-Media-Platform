const conversation_services = require("../services/conversation.services");
const { status_code, status } = require("../utils/status");

const get_user_conversations = async (req, res, next) => {
  const user_id = req.user.id;
  const result = await conversation_services.get_user_conversations(user_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, data: result });
};

const delete_conversation = async (req, res, next) => {
  const conversation_id = req.params.conversation_id;
  await conversation_services.remove_conversation(conversation_id);
  res.status(status_code.NO_CONTENT).send();
};

const create_direct_conversation = async (req, res, next) => {
  const user_id = req.user.id;
  const other_user_id = req.params.user_id;
  const conversation_id = await conversation_services.add_conversation([user_id, other_user_id]);
  res.status(status_code.OK).json({ success: status.SUCCESS, data: { conversation_id } });
};

const create_group_conversation = async (req, res, next) => {
  const user_id = req.user.id;
  const { users } = req.body;
  const conversation_id = await conversation_services.add_conversation([...users, user_id], 'group');
  res.status(status_code.OK).json({ success: status.SUCCESS, data: { conversation_id } });
};

module.exports = { 
  get_user_conversations, 
  delete_conversation, 
  create_direct_conversation, 
  create_group_conversation 
};