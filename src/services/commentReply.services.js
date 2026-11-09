const comment_reply_repositories = require("../repositories/commentReply.repositories");
const comment_repositories = require("../repositories/comment.repositories");
const post_repositories = require("../repositories/post.repositories");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");
const { sent_reply_notification } = require("./notifications.services");
const { get_user_details_by_id } = require("./user.services");
const { upload_file_to_cloudinary, delete_from_cloudinary } = require("../utils/cloudinary");
const { verify_user_blocking } = require("../utils/checkBlock");
const { verify_user_privacy } = require("../utils/checkPrivacy");

const create_reply_service = async (
  from_user_id,
  comment_id,
  to_user_id,
  text,
  file,
) => {
  if (!text && !file) {
    throw new AppError(
      "Comment text or file is required",
      status_code.BAD_REQUEST,
    );
  }

  const comment = await comment_repositories.get_comment_by_id(comment_id);
  if (!comment) {
    throw new AppError("Comment not found", status_code.NOT_FOUND);
  }

  if (comment.post_id) {
    const post = await post_repositories.get_post_by_id(comment.post_id);
    if (post) {
      await verify_user_blocking(post.user_id, from_user_id);
      await verify_user_privacy(post.user_id, from_user_id);
    }
  }

  if (to_user_id && String(to_user_id) !== String(from_user_id)) {
    await verify_user_blocking(to_user_id, from_user_id);
  }

  let file_data = null;
  if (file) {
    file_data = await upload_file_to_cloudinary(file, "social_media/comments/replies");
  }

  const reply_id = await comment_reply_repositories.create_reply(
    comment_id,
    from_user_id,
    to_user_id,
    text,
    file_data,
  );
  const reply = await comment_reply_repositories.get_reply_by_id(reply_id);

  if (String(from_user_id) !== String(to_user_id)) {
    const user = await get_user_details_by_id(from_user_id);
    await sent_reply_notification(
      from_user_id,
      to_user_id,
      "reply",
      user,
      comment,
      reply
    );
  }

  return reply;
};

const get_comment_replies_service = async (comment_id, limit, offset, requester_id = null) => {
  if (limit < 10 || limit > 100) {
    throw new AppError(
      "The limit must be at least 10 or at most 100.",
      status_code.BAD_REQUEST,
    );
  }
  const comment = await comment_repositories.get_comment_by_id(comment_id);
  if (!comment) {
    throw new AppError("Comment not found", status_code.NOT_FOUND);
  }

  if (requester_id && comment.post_id) {
    const post = await post_repositories.get_post_by_id(comment.post_id);
    if (post) {
      await verify_user_blocking(post.user_id, requester_id);
      await verify_user_privacy(post.user_id, requester_id);
    }
  }

  const replies = await comment_reply_repositories.get_replies_by_comment_id(
    comment_id,
    limit,
    offset,
  );
  return replies;
};

const update_reply_service = async (user_id, reply_id, text) => {
  if (!text) {
    throw new AppError("Reply text is required", status_code.BAD_REQUEST);
  }

  const reply = await comment_reply_repositories.get_reply_by_id(reply_id);
  if (!reply) {
    throw new AppError("Reply not found", status_code.NOT_FOUND);
  }

  if (reply.from_user_id !== user_id) {
    throw new AppError(
      "Unauthorized to update this reply",
      status_code.FORBIDDEN,
    );
  }

  await comment_reply_repositories.update_reply_by_id(reply_id, text);
  return await comment_reply_repositories.get_reply_by_id(reply_id);
};

const delete_reply_service = async (user_id, reply_id) => {
  const reply = await comment_reply_repositories.get_reply_by_id(reply_id);
  if (!reply) {
    throw new AppError("Reply not found", status_code.NOT_FOUND);
  }

  if (reply.from_user_id !== user_id) {
    throw new AppError(
      "Unauthorized to delete this reply",
      status_code.FORBIDDEN,
    );
  }

  if (reply.image_url) {
    try {
      await delete_from_cloudinary(
        reply.public_id || reply.image_url,
        reply.media_type || "image"
      );
    } catch (err) {
      console.warn("Could not delete reply media:", err.message);
    }
  }

  await comment_reply_repositories.delete_reply_by_id(reply_id);
};

module.exports = {
  create_reply_service,
  update_reply_service,
  delete_reply_service,
  get_comment_replies_service,
};
