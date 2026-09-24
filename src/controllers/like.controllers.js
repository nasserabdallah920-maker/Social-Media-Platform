const like_services = require("../services/like.services");
const { status_code, status } = require("../utils/status");

const toggle_like = async (req, res, next) => {
  const user_id = req.user.id;
  const { post_id } = req.params;

  const result = await like_services.toggle_like_service(user_id, post_id);

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    data: result,
  });
};

const get_post_likes = async (req, res, next) => {
  const { post_id } = req.params;
  const requester_id = req.user.id;

  const likes = await like_services.get_post_likes_service(post_id, requester_id);

  res.status(status_code.OK).json({
    status: status.SUCCESS,
    data: likes,
  });
};

module.exports = {
  toggle_like,
  get_post_likes,
};