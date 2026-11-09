const db = require("../config/db.config");

const create_post = async (user_id, text) => {
  const [result] = await db.query(
    "INSERT INTO posts (user_id, text) VALUES (?, ?)",
    [user_id, text],
  );
  return result.insertId;
};

const add_post_image = async (post_id, file_data) => {
  if (typeof file_data === "string") {
    await db.query(
      "INSERT INTO post_images (post_id, image_url, media_type) VALUES (?, ?, ?)",
      [post_id, file_data, "image"],
    );
  } else {
    await db.query(
      "INSERT INTO post_images (post_id, image_url, media_type, public_id, file_name, file_size) VALUES (?, ?, ?, ?, ?, ?)",
      [
        post_id,
        file_data.url,
        file_data.media_type || "image",
        file_data.public_id || null,
        file_data.file_name || null,
        file_data.file_size || null,
      ],
    );
  }
};

const get_post_by_id = async (post_id, requester_id = null) => {
  const [posts] = await db.query(
    `SELECT posts.*, users.user_name, profiles.avatar,
       EXISTS (
         SELECT 1 FROM likes WHERE likes.post_id = posts.id AND likes.user_id = ?
       ) AS is_liked,
       (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likes_count,
       (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS comments_count
     FROM posts 
     JOIN users ON posts.user_id = users.id 
     LEFT JOIN profiles ON profiles.user_id = users.id 
     WHERE posts.id = ?`, 
    [requester_id || 0, post_id]
  );
  if (posts.length === 0) return null;

  const [images] = await db.query(
    "SELECT id, image_url, media_type, public_id, file_name, file_size FROM post_images WHERE post_id = ?",
    [post_id],
  );

  return {
    ...posts[0],
    is_liked: posts[0].is_liked,
    images: images.map((img) => ({
      id: img.id,
      url: img.image_url,
      media_type: img.media_type || "image",
      public_id: img.public_id || null,
      file_name: img.file_name || null,
      file_size: img.file_size || null,
    })),
    likes_count: posts[0].likes_count,
    likes: posts[0].likes_count,
    comments_count: posts[0].comments_count,
  };
};

const get_posts_by_user_id = async (user_id, requester_id, limit, offset) => {
  const [posts] = await db.query(
    `SELECT
       posts.*,
       users.user_name,
       profiles.avatar,

       EXISTS (
         SELECT 1
         FROM likes AS user_likes
         WHERE user_likes.post_id = posts.id
           AND user_likes.user_id = ?
       ) AS is_liked,

       COALESCE(
         (
           SELECT JSON_ARRAYAGG(
             JSON_OBJECT(
               'id', post_images.id,
               'url', post_images.image_url,
               'media_type', COALESCE(post_images.media_type, 'image'),
               'public_id', post_images.public_id,
               'file_name', post_images.file_name,
               'file_size', post_images.file_size
             )
           )
           FROM post_images
           WHERE post_images.post_id = posts.id
         ),
         JSON_ARRAY()
       ) AS images,

       (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likes_count,
       (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS comments_count

     FROM posts
     JOIN users ON posts.user_id = users.id
     LEFT JOIN profiles ON profiles.user_id = users.id
     WHERE posts.user_id = ?
     ORDER BY posts.created_at DESC
     LIMIT ? OFFSET ?`,
    [requester_id || 0, user_id, limit, offset],
  );

  return posts;
};

const update_post_by_id = async (post_id, text) => {
  await db.query("UPDATE posts SET text = ? WHERE id = ?", [text, post_id]);
};

const delete_post_by_id = async (post_id) => {
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
      profiles.avatar,

      EXISTS (
        SELECT 1
        FROM likes AS user_likes
        WHERE user_likes.post_id = posts.id
          AND user_likes.user_id = ?
      ) AS is_liked,

      COALESCE(
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', post_images.id,
              'url', post_images.image_url,
              'media_type', COALESCE(post_images.media_type, 'image'),
              'public_id', post_images.public_id,
              'file_name', post_images.file_name,
              'file_size', post_images.file_size
            )
          )
          FROM post_images
          WHERE post_images.post_id = posts.id
        ),
        JSON_ARRAY()
      ) AS images,

      (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likes_count,
      (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS comments_count

    FROM posts
    JOIN users
      ON posts.user_id = users.id
    LEFT JOIN profiles
      ON profiles.user_id = users.id
    WHERE
      posts.text LIKE ?
      AND (
        posts.user_id = ?
        OR COALESCE(profiles.is_private, 0) = 0
        OR EXISTS (
          SELECT 1 FROM follows
          WHERE follows.follower_id = ? AND follows.following_id = posts.user_id
        )
      )
      AND NOT EXISTS (
        SELECT 1
        FROM blocks
        WHERE
          (blocks.blocker_id = ? AND blocks.blocked_id = posts.user_id)
          OR
          (blocks.blocker_id = posts.user_id AND blocks.blocked_id = ?)
      )
    `,
    [user_id, `%${search}%`, user_id, user_id, user_id, user_id],
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
