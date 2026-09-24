const comment_services = require("../services/comment.services");
const { status_code, status } = require("../utils/status");

const create_comment = async (req, res, next) => {
  const user_id = req.user.id;
  const { post_id } = req.params;
  const { text } = req.body;
  const file = req.file;

  const comment = await comment_services.create_comment_service(user_id, post_id, text, file);

  res.status(status_code.CREATED).json({
    status: status.SUCCESS,
    data: comment,
  });
};

const get_post_comments = async (req, res, next) => {
  const { post_id } = req.params;
  const requester_id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const comments = await comment_services.get_post_comments_service(post_id, requester_id, limit, offset);

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    data: comments,
  });
};

const update_comment = async (req, res, next) => {
  const user_id = req.user.id;
  const { id } = req.params;
  const { text } = req.body;

  const comment = await comment_services.update_comment_service(user_id, id, text);

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    data: comment,
  });
};

const delete_comment = async (req, res, next) => {
  const user_id = req.user.id;
  const { id } = req.params;

  await comment_services.delete_comment_service(user_id, id);

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    message: "Comment deleted successfully",
  });
};

module.exports = {
  create_comment,
  get_post_comments,
  update_comment,
  delete_comment,
};