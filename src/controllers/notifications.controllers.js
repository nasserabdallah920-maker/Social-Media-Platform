const {
  get_notifications,
  get_unread_count,
  set_read_all_notifications,
  set_read_notification,
  remove_notification,
  get_notifications_unread
} = require("../services/notifications.services"); 

const get_all_notifications = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const notifications = await get_notifications(
    req.user.id,
    Number(page),
    Number(limit),
  );

  const nextPage = notifications.length < Number(limit) ? null : Number(page) + 1;

  res.status(200).json({
    success: true,
    data: notifications,
    nextPage,
  });
};

const get_all_unreaded_notifications = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const notifications = await get_notifications_unread(
    req.user.id,
    Number(page),
    Number(limit),
  );

  const nextPage = notifications.length < Number(limit) ? null : Number(page) + 1;

  res.status(200).json({
    success: true,
    data: notifications,
    nextPage,
  });
};

const read_one = async (req, res, next) => {
  const { id } = req.params;

  await set_read_notification(
    id,
    req.user.id,
  );

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
  });
};

const read_all = async (req, res, next) => {
  await set_read_all_notifications(req.user.id);

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
};

const get_unread = async (req, res, next) => {
  const unread_count = await get_unread_count(
    req.user.id,
  );

  res.status(200).json({
    success: true,
    unread_count,
  });
};

const delete_notification = async (req, res, next) => {
  const { id } = req.params;
  await remove_notification(id, req.user.id);

  res.status(200).json({
    success: true,
    message: "Notification deleted",
  });
};

module.exports = {
  get_all_notifications,
  read_one,
  read_all,
  get_unread,
  delete_notification,
  get_all_unreaded_notifications
};