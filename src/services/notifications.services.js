const {
  create_notification,
  count_unread_notifications,
  read_all_notifications,
  read_notification,
  get_user_notifications,
  delete_notification,
  get_user_notifications_unreaded,
} = require("../repositories/notification.repositories");
const { get_io } = require("../socket/socketManager");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");

const sent_follow_notification = async (
  following_id,
  follower_id,
  type,
  user,
) => {
  const io = get_io();
  const notification_id = await create_notification(
    following_id,
    follower_id,
    type,
    null,
    null,
  );

  io.to(`user-${following_id}`).emit("notification", {
    id: notification_id,
    type: type,
    user: {
      id: follower_id,
      user_name: user.user_name,
      avatar: user.avatar,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: Date.now(),
    },
  });
  return;
};

const sent_like_notification = async (
  user_liker,
  user_liked,
  type,
  user,
  post,
) => {
  const io = get_io();
  const notification_id = await create_notification(
    user_liked,
    user_liker,
    type,
    post.id,
    null,
  );
  io.to(`user-${user_liked}`).emit("notification", {
    id: notification_id,
    type: type,
    user: {
      id: user_liker,
      user_name: user.user_name,
      avatar: user.avatar,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: Date.now(),
    },
    post: {
      id: post.id,
      text: post.text,
    },
  });
  return;
};

const sent_comment_notification = async (
  user_commenter,
  user_post_owner,
  type,
  user,
  post,
  comment,
) => {
  const io = get_io();
  const notification_id = await create_notification(
    user_post_owner,
    user_commenter,
    type,
    post.id,
    comment.id,
  );
  io.to(`user-${user_post_owner}`).emit("notification", {
    id: notification_id,
    type: type,
    user: {
      id: user_commenter,
      user_name: user.user_name,
      avatar: user.avatar,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: Date.now(),
    },
    post: {
      id: post.id,
      text: post.text,
    },
    comment: {
      id: comment.id,
      text: comment.text,
    },
  });
  return;
};

const sent_reply_notification = async (
  user_replier,
  user_comment_owner,
  type,
  user,
  comment,
  reply,
) => {
  const io = get_io();
  const notification_id = await create_notification(
    user_comment_owner,
    user_replier,
    type,
    comment.post_id,
    comment.id,
  );
  io.to(`user-${user_comment_owner}`).emit("notification", {
    id: notification_id,
    type: type,
    user: {
      id: user_replier,
      user_name: user.user_name,
      avatar: user.avatar,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: Date.now(),
    },
    comment: {
      id: comment.id,
      text: comment.text,
    },
    reply: {
      id: reply.id,
      text: reply.text,
    },
  });
  return;
};

const get_notifications = async (user_id, page = 1, limit = 10) => {
    if(limit<10 || limit>100){
    throw new AppError('The limit must be at least 10 or at most 100.',status_code.BAD_REQUEST)
  }
  const offset = (page - 1) * limit;

  return await get_user_notifications(user_id, limit, offset);
};
const get_notifications_unread = async (user_id, page = 1, limit = 10) => {
    if(limit<10 || limit>100){
    throw new AppError('The limit must be at least 10 or at most 100.',status_code.BAD_REQUEST)
  }
  const offset = (page - 1) * limit;

  return await get_user_notifications_unreaded(user_id, limit, offset);
};

const set_read_notification = async (notification_id, user_id) => {
  const result = await read_notification(notification_id, user_id);

  if (!result || (result.affectedRows !== undefined && result.affectedRows === 0)) {
    throw new AppError("Notification not found", status_code.NOT_FOUND);
  }

  return result.affectedRows !== undefined ? result.affectedRows : result;
};

const set_read_all_notifications = async (user_id) => {
  const result = await read_all_notifications(user_id);

  return result.affectedRows;
};

const get_unread_count = async (user_id) => {
  return await count_unread_notifications(user_id);
};

const remove_notification = async (notification_id, user_id) => {
  const result = await delete_notification(notification_id, user_id);
  
  if (!result || (result.affectedRows !== undefined && result.affectedRows === 0)) {
    throw new AppError("Notification not found", status_code.NOT_FOUND);
  }
  
  return result;
};

module.exports = {
  get_notifications,
  set_read_notification,
  set_read_all_notifications,
  get_unread_count,
  sent_follow_notification,
  sent_like_notification,
  sent_comment_notification,
  sent_reply_notification,
  remove_notification,
  get_notifications_unread
};