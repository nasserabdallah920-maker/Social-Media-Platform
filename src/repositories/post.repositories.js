const db = require("../config/db.config");

const create_post = async (user_id, text) => {
  const [result] = await db.query(
    "INSERT INTO posts (user_id, text) VALUES (?, ?)",
    [user_id, text],
  );
  return result.insertId;
};

const add_post_image = async (post_id, image_url) => {
  await db.query(
    "INSERT INTO post_images (post_id, image_url) VALUES (?, ?)",
    [post_id, image_url],
  );
};

const get_post_by_id = async (post_id) => {
  const [posts] = await db.query("SELECT * FROM posts WHERE id = ?", [post_id]);
  if (posts.length === 0) return null;

  const [images] = await db.query(
    "SELECT image_url FROM post_images WHERE post_id = ?",
    [post_id],
  );

  const [likes] = await db.query(
    `SELECT COUNT(*) AS likes FROM likes WHERE post_id = ?`,
    [post_id],
  );

  return {
    ...posts[0],
    likes: likes[0].likes,
    images: images.map((img) => img.image_url),
  };
};

const get_posts_by_user_id = async (user_id, limit, offset) => {
  const [posts] = await db.query(
    "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [user_id, limit, offset],
  );

  for (let post of posts) {
    const [images] = await db.query(
      "SELECT image_url FROM post_images WHERE post_id = ?",
      [post.id],
    );
    post.images = images.map((img) => img.image_url);
  }

  return posts;
};

const update_post_by_id = async (post_id, text) => {
  await db.query("UPDATE posts SET text = ? WHERE id = ?", [text, post_id]);
};

const delete_post_by_id = async (post_id) => {
  // Delete images first if cascading delete is not enabled
  await db.query("DELETE FROM post_images WHERE post_id = ?", [post_id]);
  await db.query("DELETE FROM posts WHERE id = ?", [post_id]);
};

const delete_post_image = async (post_id, image_url) => {
  await db.query(
    "DELETE FROM post_images WHERE post_id = ? AND image_url = ?",
    [post_id, image_url],
  );
};

const search_posts = async (search, user_id) => {
  const [rows] = await db.query(
    `
    SELECT 
      posts.*,
      users.user_name,
      users.first_name,
      users.last_name,
      profiles.avatar
    FROM posts
    JOIN users
      ON posts.user_id = users.id
    LEFT JOIN profiles
      ON profiles.user_id = users.id
    WHERE 
      posts.text LIKE ?
      AND NOT EXISTS (
        SELECT 1
        FROM blocks
        WHERE 
          (blocks.blocker_id = ? AND blocks.blocked_id = posts.user_id)
          OR
          (blocks.blocker_id = posts.user_id AND blocks.blocked_id = ?)
      )
    `,
    [`%${search}%`, user_id, user_id],
  );

  return rows;
};

module.exports = {
  create_post,
  add_post_image,
  get_post_by_id,
  get_posts_by_user_id,
  update_post_by_id,
  delete_post_by_id,
  delete_post_image,
  search_posts,
};