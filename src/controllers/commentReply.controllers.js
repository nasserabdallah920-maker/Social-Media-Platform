const comment_reply_services = require("../services/commentReply.services");
const { status_code, status } = require("../utils/status");

const create_reply = async (req, res, next) => {
  const user_id = req.user.id;
  const { comment_id } = req.params;
  const { text, to_user_id } = req.body;
  const file = req.file;

  const reply = await comment_reply_services.create_reply_service(user_id, comment_id, to_user_id, text, file);

  res.status(status_code.CREATED).json({
    status: status.SUCCESS,
    data: reply,
  });
};

const get_comment_replies = async (req, res, next) => {
  const { comment_id } = req.params;
  const requester_id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const replies = await comment_reply_services.get_comment_replies_service(comment_id, limit, offset, requester_id);
  const nextPage = replies.length < limit ? null : page + 1;

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    data: replies,
    nextPage,
  });
};

const update_reply = async (req, res, next) => {
  const user_id = req.user.id;
  const { id } = req.params;
  const { text } = req.body;

  const reply = await comment_reply_services.update_reply_service(user_id, id, text);

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    data: reply,
  });
};

const delete_reply = async (req, res, next) => {
  const user_id = req.user.id;
  const { id } = req.params;

  await comment_reply_services.delete_reply_service(user_id, id);

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    message: "Reply deleted successfully",
  });
};

module.exports = {
  create_reply,
  update_reply,
  delete_reply,
  get_comment_replies,
};