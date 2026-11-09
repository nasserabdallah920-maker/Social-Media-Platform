const db = require("../config/db.config");

const create_reply = async (
  comment_id,
  from_user_id,
  to_user_id,
  text,
  file_data,
) => {
  const [result] = await db.query(
    "INSERT INTO comment_replies (comment_id, from_user_id, to_user_id, text) VALUES (?, ?, ?, ?)",
    [comment_id, from_user_id, to_user_id, text],
  );
  if (file_data) {
    if (typeof file_data === "string") {
      await db.query(
        "INSERT INTO comment_images (reply_comment_id, image_url, media_type) VALUES (?, ?, ?)",
        [result.insertId, file_data, "image"],
      );
    } else {
      await db.query(
        "INSERT INTO comment_images (reply_comment_id, image_url, media_type, public_id, file_name, file_size) VALUES (?, ?, ?, ?, ?, ?)",
        [
          result.insertId,
          file_data.url,
          file_data.media_type || "image",
          file_data.public_id || null,
          file_data.file_name || null,
          file_data.file_size || null,
        ],
      );
    }
  }
  return result.insertId;
};

const get_reply_by_id = async (reply_id) => {
  const [replies] = await db.query(
    `SELECT comment_replies.*, 
            comment_replies.from_user_id AS user_id, 
            comment_images.image_url, 
            comment_images.media_type, 
            comment_images.public_id, 
            comment_images.file_name, 
            comment_images.file_size,
            users.user_name, 
            profiles.avatar
    FROM comment_replies
    JOIN users
    ON comment_replies.from_user_id = users.id 
    LEFT JOIN profiles
    ON profiles.user_id = users.id
    LEFT JOIN comment_images
    ON comment_replies.id = comment_images.reply_comment_id
    WHERE comment_replies.id = ?`,
    [reply_id],
  );
  return replies[0];
};

const get_replies_by_comment_id = async (comment_id, limit, offset) => {
  const [comments] = await db.query(
    `SELECT comment_replies.*, 
            comment_replies.from_user_id AS user_id, 
            comment_images.image_url, 
            comment_images.media_type, 
            comment_images.public_id, 
            comment_images.file_name, 
            comment_images.file_size,
            users.user_name, 
            profiles.avatar
    FROM comment_replies
    JOIN users
    ON comment_replies.from_user_id = users.id 
    LEFT JOIN profiles
    ON profiles.user_id = users.id
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
