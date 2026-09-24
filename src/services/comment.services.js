const comment_repositories = require("../repositories/comment.repositories");
const post_repositories = require("../repositories/post.repositories");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");
const { sent_comment_notification } = require("./notifications.services");
const { get_user_details_by_id } = require("./user.services");
const { verify_user_blocking } = require("../utils/checkBlock");
const { verify_user_privacy } = require("../utils/checkPrivacy");

const create_comment_service = async (user_id, post_id, text, file) => {
  if (!text && !file) {
    throw new AppError(
      "Comment text or file is required",
      status_code.BAD_REQUEST,
    );
  }

  const post = await post_repositories.get_post_by_id(post_id);
  if (!post) {
    throw new AppError("Post not found", status_code.NOT_FOUND);
  }

  const target_user= post.user_id
  await verify_user_blocking(target_user,user_id)
  await verify_user_privacy(target_user,user_id)
  let file_url = null
  if(file){
    file_url = `/uploads/${file.filename}`
  }
  const comment_id = await comment_repositories.create_comment(
    user_id,
    post_id,
    text,
    file_url,
  );
  const comment = await comment_repositories.get_comment_by_id(comment_id);
  const user = await get_user_details_by_id(user_id);

  if (String(user_id) !== String(post.user_id)) {
    await sent_comment_notification(
      user_id,
      post.user_id,
      "comment",
      user,
      post,
      comment,
    );
  }

  return comment;
};

const get_post_comments_service = async (
  post_id,
  requester_id,
  limit,
  offset,
) => {
    if(limit<10 || limit>100){
    throw new AppError('The limit must be at least 10 or at most 100.',status_code.BAD_REQUEST)
  }
  const post = await post_repositories.get_post_by_id(post_id);
  if (!post) {
    throw new AppError("Post not found", status_code.NOT_FOUND);
  }

  await verify_user_blocking(post.user_id, requester_id);
  await verify_user_privacy(post.user_id, requester_id);

  const comments = await comment_repositories.get_comments_by_post_id(
    post_id,
    limit,
    offset,
  );
  return comments;
};

const update_comment_service = async (user_id, comment_id, text) => {
  if (!text) {
    throw new AppError("Comment text is required", status_code.BAD_REQUEST);
  }

  const comment = await comment_repositories.get_comment_by_id(comment_id);
  if (!comment) {
    throw new AppError("Comment not found", status_code.NOT_FOUND);
  }

  if (comment.user_id !== user_id) {
    throw new AppError(
      "Unauthorized to update this comment",
      status_code.FORBIDDEN,
    );
  }

  await comment_repositories.update_comment_by_id(comment_id, text);
  return await comment_repositories.get_comment_by_id(comment_id);
};

const delete_comment_service = async (user_id, comment_id) => {
  const comment = await comment_repositories.get_comment_by_id(comment_id);
  if (!comment) {
    throw new AppError("Comment not found", status_code.NOT_FOUND);
  }

  if (comment.user_id !== user_id) {
    throw new AppError(
      "Unauthorized to delete this comment",
      status_code.FORBIDDEN,
    );
  }

  await comment_repositories.delete_comment_by_id(comment_id);
};

module.exports = {
  create_comment_service,
  get_post_comments_service,
  update_comment_service,
  delete_comment_service,
};