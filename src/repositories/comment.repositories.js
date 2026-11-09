const db = require("../config/db.config");

const create_comment = async (user_id, post_id, text, file_data) => {
  const [result] = await db.query(
    "INSERT INTO comments (user_id, post_id, text) VALUES (?, ?, ?)",
    [user_id, post_id, text],
  );
  if (file_data) {
    if (typeof file_data === "string") {
      await db.query(
        "INSERT INTO comment_images (comment_id, image_url, media_type) VALUES (?, ?, ?)",
        [result.insertId, file_data, "image"],
      );
    } else {
      await db.query(
        "INSERT INTO comment_images (comment_id, image_url, media_type, public_id, file_name, file_size) VALUES (?, ?, ?, ?, ?, ?)",
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

const get_comment_by_id = async (comment_id) => {
  const [comments] = await db.query(
    `SELECT comments.*, 
            comment_images.image_url, 
            comment_images.media_type, 
            comment_images.public_id, 
            comment_images.file_name, 
            comment_images.file_size,
            users.user_name, 
            profiles.avatar
    FROM comments
    JOIN users
    ON comments.user_id = users.id
    LEFT JOIN profiles
    ON profiles.user_id = users.id
    LEFT JOIN comment_images
    ON comments.id = comment_images.comment_id
    WHERE comments.id = ?`,
    [comment_id],
  );

  return comments[0];
};

const get_comments_by_post_id = async (post_id, limit, offset) => {
  const [comments] = await db.query(
    `SELECT comments.*, 
            comment_images.image_url, 
            comment_images.media_type, 
            comment_images.public_id, 
            comment_images.file_name, 
            comment_images.file_size,
            users.user_name, 
            profiles.avatar,
      (SELECT COUNT(*) FROM comment_replies WHERE comment_replies.comment_id = comments.id) AS replies_count
    FROM comments
    JOIN users
    ON comments.user_id = users.id 
    LEFT JOIN profiles
    ON profiles.user_id = users.id
    LEFT JOIN comment_images
    ON comments.id = comment_images.comment_id
    WHERE post_id = ?
    ORDER BY comments.created_at DESC
    LIMIT ? OFFSET ?
`,
    [post_id, limit, offset],
  );

  return comments;
};

const update_comment_by_id = async (comment_id, text) => {
  await db.query("UPDATE comments SET text = ? WHERE id = ?", [
    text,
    comment_id,
  ]);
};

const delete_comment_by_id = async (comment_id) => {
  await db.query("DELETE FROM comments WHERE id = ?", [comment_id]);
};

module.exports = {
  create_comment,
  get_comment_by_id,
  get_comments_by_post_id,
  update_comment_by_id,
  delete_comment_by_id,
};
