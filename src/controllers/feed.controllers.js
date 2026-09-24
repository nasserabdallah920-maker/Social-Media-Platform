const { status, status_code } = require("../utils/status");
const feed_services = require("../services/feed.services");

const feed_posts = async (req, res, next) => {
  const { id } = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const posts = await feed_services.handle_feed_posts(id, limit, offset);

  res.status(status_code.OK).json({
    success: status.SUCCESS,
    posts: posts,
  });
};

const search = async (req, res, next) => {
  const { q } = req.query;
  const user_id = req.user.id;

  const result = await feed_services.search(q, user_id);

  return res.status(status_code.OK).json({
    success: status.SUCCESS,
    data: result,
  });
};

module.exports = { feed_posts, search };