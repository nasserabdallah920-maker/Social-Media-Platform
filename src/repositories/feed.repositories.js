const db = require("../config/db.config");

const get_posts_feed = async (user_id, limit, offset) => {
  const [results] = await db.query(
    `SELECT 
    posts.*,
    MAX(users.user_name) AS user_name,
    MAX(profiles.avatar) AS avatar,
    COUNT(DISTINCT likes.id) AS likes_count,
    COUNT(DISTINCT comments.id) AS comments_count
FROM posts
JOIN follows 
    ON follows.following_id = posts.user_id
JOIN users 
    ON users.id = posts.user_id
JOIN profiles 
    ON profiles.user_id = posts.user_id
LEFT JOIN likes 
    ON likes.post_id = posts.id
LEFT JOIN comments 
    ON comments.post_id = posts.id
WHERE follows.follower_id = ?
AND NOT EXISTS (
    SELECT 1
    FROM blocks
    WHERE 
        (blocker_id = ? AND blocked_id = posts.user_id)
        OR 
        (blocker_id = posts.user_id AND blocked_id = ?)
)
GROUP BY posts.id
ORDER BY posts.created_at DESC
LIMIT ? OFFSET ?`,
    [user_id, user_id, user_id, limit, offset]
  );
  return results;
};


module.exports = { get_posts_feed };
