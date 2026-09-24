const db = require("../config/db.config");

const create_comment = async (user_id, post_id, text, image_url) => {
  const [result] = await db.query(
    "INSERT INTO comments (user_id, post_id, text) VALUES (?, ?, ?)",
    [user_id, post_id, text],
  );
  if (image_url) {
    await db.query(
      "INSERT INTO comment_images (comment_id, image_url) VALUES (?, ?)",
      [result.insertId, image_url],
    );
  }
  return result.insertId;
};

const get_comment_by_id = async (comment_id) => {
  const [comments] = await db.query("SELECT * FROM comments WHERE id = ?", [
    comment_id,
  ]);

  return comments[0];
};

const get_comments_by_post_id = async (post_id, limit, offset) => {
  const [comments] = await db.query(
    `SELECT comments.*, comment_images.image_url, users.user_name
    FROM comments
    JOIN users
    ON comments.user_id = users.id 
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