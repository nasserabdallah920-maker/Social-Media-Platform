const post_services = require("../services/post.services");
const { status_code, status } = require("../utils/status");

const create_post = async (req, res, next) => {
  const user_id = req.user.id;
  const { text } = req.body;
  const files = req.files;

  const post = await post_services.create_post_service(user_id, text, files);

  res.status(status_code.CREATED).json({
    status: status.SUCCESS,
    data: post,
  });
};

const get_post = async (req, res, next) => {
  const { id } = req.params;
  const requester_id = req.user.id;
  const post = await post_services.get_post_service(id, requester_id);

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    data: post,
  });
};

const get_user_posts = async (req, res, next) => {
  const { user_id } = req.params;
  const requester_id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const posts = await post_services.get_user_posts_service(user_id, requester_id, limit, offset);

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    data: posts,
  });
};

const update_post = async (req, res, next) => {
  const user_id = req.user.id;
  const { id } = req.params;
  const { text } = req.body;

  const post = await post_services.update_post_service(user_id, id, text);

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    data: post,
  });
};

const post_new_files = async (req, res, next) => {
  const user_id = req.user.id;
  const { id } = req.params;
  const files = req.files;

  const post = await post_services.add_post_files(user_id, id, files);

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    data: post,
  });
};

const delete_post = async (req, res, next) => {
  const user_id = req.user.id;
  const { id } = req.params;

  await post_services.delete_post_service(user_id, id);

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    message: "Post deleted successfully",
  });
};

const delete_post_file = async (req, res, next) => {
  const user_id = req.user.id;
  const { id } = req.params;
  const { file_url } = req.body;
  await post_services.delete_post_file_service(user_id, id, file_url);

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    message: "Post image deleted successfully",
  });
};

module.exports = {
  create_post,
  get_post,
  get_user_posts,
  update_post,
  delete_post,
  delete_post_file,
  post_new_files,
};