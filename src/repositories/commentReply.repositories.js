const db = require("../config/db.config");

const create_reply = async (
  comment_id,
  from_user_id,
  to_user_id,
  text,
  image_url,
) => {
  const [result] = await db.query(
    "INSERT INTO comment_replies (comment_id, from_user_id, to_user_id, text) VALUES (?, ?, ?, ?)",
    [comment_id, from_user_id, to_user_id, text],
  );
  if (image_url) {
    await db.query(
      "INSERT INTO comment_images (reply_comment_id, image_url) VALUES (?, ?)",
      [result.insertId, image_url],
    );
  }
  return result.insertId;
};

const get_reply_by_id = async (reply_id) => {
  const [replies] = await db.query(
    "SELECT * FROM comment_replies WHERE id = ?",
    [reply_id],
  );
  return replies[0];
};

const get_replies_by_comment_id = async (comment_id, limit, offset) => {
  const [comments] = await db.query(
    `SELECT comment_replies.*, comment_images.image_url, users.user_name
    FROM comment_replies
    JOIN users
    ON comment_replies.from_user_id = users.id 
    LEFT JOIN comment_images
    ON comment_replies.id = comment_images.reply_comment_id
    WHERE comment_replies.comment_id = ?
    ORDER BY comment_replies.created_at DESC
    LIMIT ? OFFSET ?
`,
    [comment_id, limit, offset],
  );

  return comments;
};

const update_reply_by_id = async (reply_id, text) => {
  await db.query("UPDATE comment_replies SET text = ? WHERE id = ?", [
    text,
    reply_id,
  ]);
};

const delete_reply_by_id = async (reply_id) => {
  await db.query("DELETE FROM comment_replies WHERE id = ?", [reply_id]);
};

module.exports = {
  create_reply,
  get_reply_by_id,
  update_reply_by_id,
  delete_reply_by_id,
  get_replies_by_comment_id,
};