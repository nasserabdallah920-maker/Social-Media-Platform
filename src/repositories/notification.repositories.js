const db = require("../config/db.config");

const create_notification = async (
  user_id,
  actor_id,
  type,
  post_id,
  comment_id,
) => {
  const [results] = await db.query(
    `
      INSERT INTO notifications
      (user_id, actor_id, type, post_id, comment_id)
      VALUES (?, ?, ?, ?, ?)
    `,
    [user_id, actor_id, type, post_id, comment_id],
  );

  return results.insertId;
};

const get_user_notifications = async (user_id, limit = 10, offset = 0) => {
  const [results] = await db.query(
    `
SELECT n.*,p.avatar, u.user_name , c.text FROM notifications n
left join profiles p
on n.actor_id = p.user_id
left join users u
on n.actor_id = u.id
left join comments c
on n.comment_id = c.id
WHERE n.user_id = ?
ORDER BY n.created_at DESC
LIMIT ? OFFSET ?
    `,
    [user_id, limit, offset],
  );

  return results;
};
const get_user_notifications_unreaded = async (user_id, limit = 10, offset = 0) => {
  const [results] = await db.query(
    `
SELECT n.*,p.avatar, u.user_name , c.text FROM notifications n
left join profiles p
on n.actor_id = p.user_id
left join users u
on n.actor_id = u.id
left join comments c
on n.comment_id = c.id
WHERE n.user_id = ? and n.is_read=false
ORDER BY n.created_at DESC
LIMIT ? OFFSET ?
    `,
    [user_id, limit, offset],
  );

  return results;
};

const read_notification = async (notification_id, user_id) => {
  const [results] = await db.query(
    `
      UPDATE notifications
      SET is_read = true
      WHERE id = ? AND user_id = ?
    `,
    [notification_id, user_id],
  );

  return results;
};

const read_all_notifications = async (user_id) => {
  const [results] = await db.query(
    `
      UPDATE notifications
      SET is_read = true
      WHERE user_id = ?
    `,
    [user_id],
  );

  return results;
};

const count_unread_notifications = async (user_id) => {
  const [results] = await db.query(
    `
      SELECT COUNT(*) AS unread
      FROM notifications
      WHERE user_id = ? AND is_read = false
    `,
    [user_id],
  );

  return results[0].unread;
};

const delete_notification = async (notification_id, user_id) => {
  const [results] = await db.query(
    `
      DELETE FROM notifications
      WHERE id = ? AND user_id = ?
    `,
    [notification_id, user_id]
  );
  return results.affectedRows;
};

module.exports = {
  create_notification,
  get_user_notifications,
  read_notification,
  read_all_notifications,
  count_unread_notifications,
  delete_notification,
  get_user_notifications_unreaded
};