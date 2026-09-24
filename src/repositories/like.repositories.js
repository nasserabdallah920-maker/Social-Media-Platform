const db = require("../config/db.config");

const add_like = async (user_id, post_id) => {
  await db.query("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [
    user_id,
    post_id,
  ]);
};

const remove_like = async (user_id, post_id) => {
  await db.query("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [
    user_id,
    post_id,
  ]);
};

const get_like_by_user_and_post = async (user_id, post_id) => {
  const [likes] = await db.query(
    "SELECT * FROM likes WHERE user_id = ? AND post_id = ?",
    [user_id, post_id],
  );
  return likes[0];
};

const get_likes_by_post_id = async (post_id) => {
  const [likes] = await db.query(
    "SELECT likes.*, users.user_name FROM likes JOIN users ON likes.user_id = users.id WHERE post_id = ?",
    [post_id],
  );
  return likes;
};

module.exports = {
  add_like,
  remove_like,
  get_like_by_user_and_post,
  get_likes_by_post_id,
};