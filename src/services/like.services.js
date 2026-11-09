const like_repositories = require("../repositories/like.repositories");
const post_repositories = require("../repositories/post.repositories");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");
const { sent_like_notification } = require("./notifications.services");
const { get_user_details_by_id } = require("./user.services");
const { verify_user_blocking } = require("../utils/checkBlock");
const { verify_user_privacy } = require("../utils/checkPrivacy");

const Redis = require("../config/redis.config");

const toggle_like_service = async (user_id, post_id) => {
  const post = await post_repositories.get_post_by_id(post_id);
  if (!post) {
    throw new AppError("Post not found", status_code.NOT_FOUND);
  }

  await verify_user_blocking(post.user_id, user_id);
  await verify_user_privacy(post.user_id, user_id);

  const existing_like = await like_repositories.get_like_by_user_and_post(
    user_id,
    post_id,
  );
  const user = await get_user_details_by_id(user_id);
  if (existing_like) {
    await like_repositories.remove_like(user_id, post_id);
    await Redis.del(`post:${post_id}`);
    return { liked: false };
  } else {
    await like_repositories.add_like(user_id, post_id);
    await Redis.del(`post:${post_id}`);

    if (String(user_id) !== String(post.user_id)) {
      await sent_like_notification(
        user_id,
        post.user_id,
        "like",
        user,
        post,
      );
    }
    return { liked: true };
  }
};

const get_post_likes_service = async (post_id, requester_id) => {
  const post = await post_repositories.get_post_by_id(post_id);
  if (!post) {
    throw new AppError("Post not found", status_code.NOT_FOUND);
  }

  await verify_user_blocking(post.user_id, requester_id);
  await verify_user_privacy(post.user_id, requester_id);

  const likes = await like_repositories.get_likes_by_post_id(post_id);
  return likes;
};

module.exports = {
  toggle_like_service,
  get_post_likes_service,
};