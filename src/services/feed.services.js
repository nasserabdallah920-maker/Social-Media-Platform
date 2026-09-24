const feed_repositories = require("../repositories/feed.repositories");
const post_repositories = require("../repositories/post.repositories");
const user_repositories = require("../repositories/user.repositories");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");

const handle_feed_posts = async (user_id, limit, offset) => {
    if(limit<10 || limit>100){
    throw new AppError('The limit must be at least 10 or at most 100.',status_code.BAD_REQUEST)
  }
  const posts = await feed_repositories.get_posts_feed(user_id, limit, offset);
  return posts;
};

const search = async (query, user_id) => {
  if (!query || !query.trim()) {
    throw new AppError("Search query is required", status_code.BAD_REQUEST);
  }

  const clean_query = query.trim();
  const [users, posts] = await Promise.all([
    user_repositories.search_users(clean_query, user_id),
    post_repositories.search_posts(clean_query, user_id),
  ]);

  return {
    users,
    posts,
  };
};

module.exports = { handle_feed_posts, search };