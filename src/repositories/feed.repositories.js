const db = require("../config/db.config");

const get_posts_feed = async (user_id, limit, offset) => {
const [results] = await db.query(
  `
  SELECT
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

    (
      SELECT COUNT(*)
      FROM likes
      WHERE likes.post_id = posts.id
    ) AS likes_count,

    (
      SELECT COUNT(*)
      FROM comments
      WHERE comments.post_id = posts.id
    ) AS comments_count

  FROM posts

  JOIN follows
    ON follows.following_id = posts.user_id

  JOIN users
    ON users.id = posts.user_id

  LEFT JOIN profiles
    ON profiles.user_id = posts.user_id

  WHERE follows.follower_id = ?

    AND NOT EXISTS (
      SELECT 1
      FROM blocks
      WHERE
        (blocker_id = ? AND blocked_id = posts.user_id)
        OR
        (blocker_id = posts.user_id AND blocked_id = ?)
    )

  ORDER BY posts.created_at DESC

  LIMIT ? OFFSET ?
  `,
  [user_id, user_id, user_id, user_id, limit, offset]
);

  return results;
};

module.exports = { get_posts_feed };
