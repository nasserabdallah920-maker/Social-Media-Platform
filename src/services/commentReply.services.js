const comment_reply_repositories = require("../repositories/commentReply.repositories");
const comment_repositories = require("../repositories/comment.repositories");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");
const { sent_reply_notification } = require("./notifications.services");
const { get_user_details_by_id } = require("./user.services");

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
  let file_url = null;
  if (file) {
    file_url = `/uploads/${file.filename}`;
  }

  const reply_id = await comment_reply_repositories.create_reply(
    comment_id,
    from_user_id,
    to_user_id,
    text,
    file_url,
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

const get_comment_replies_service = async (comment_id, limit, offset) => {
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

  await comment_reply_repositories.delete_reply_by_id(reply_id);
};

module.exports = {
  create_reply_service,
  update_reply_service,
  delete_reply_service,
  get_comment_replies_service,
};
