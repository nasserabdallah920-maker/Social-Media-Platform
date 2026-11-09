const comment_repositories = require("../repositories/comment.repositories");
const comment_reply_repositories = require("../repositories/commentReply.repositories");
const post_repositories = require("../repositories/post.repositories");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");
const { sent_comment_notification } = require("./notifications.services");
const { get_user_details_by_id } = require("./user.services");
const { verify_user_blocking } = require("../utils/checkBlock");
const { verify_user_privacy } = require("../utils/checkPrivacy");
const Redis = require("../config/redis.config");
const { upload_file_to_cloudinary, delete_from_cloudinary } = require("../utils/cloudinary");

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
  let file_data = null;
  if (file) {
    file_data = await upload_file_to_cloudinary(file, "social_media/comments");
  }
  const comment_id = await comment_repositories.create_comment(
    user_id,
    post_id,
    text,
    file_data,
  );
  await Redis.del(`post:${post_id}`);
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
  replies_limit = 3,
  replies_page = 1,
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

  const replies_offset = (replies_page - 1) * replies_limit;

  for (const comment of comments) {
    const replies = await comment_reply_repositories.get_replies_by_comment_id(
      comment.id,
      replies_limit,
      replies_offset,
    );
    comment.replies = replies;
    comment.replies_page = replies_page;
    comment.replies_limit = replies_limit;
    comment.replies_has_more = comment.replies_count > (replies_offset + replies.length);
  }

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

  if (comment.image_url) {
    try {
      await delete_from_cloudinary(
        comment.public_id || comment.image_url,
        comment.media_type || "image"
      );
    } catch (err) {
      console.warn("Could not delete comment media:", err.message);
    }
  }

  await comment_repositories.delete_comment_by_id(comment_id);
  if (comment.post_id) {
    await Redis.del(`post:${comment.post_id}`);
  }
};

module.exports = {
  create_comment_service,
  get_post_comments_service,
  update_comment_service,
  delete_comment_service,
};