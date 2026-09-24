const db = require("../config/db.config");

const check_follow = async (follower_id, following_id) => {
  const [rows] = await db.query(
    "SELECT * FROM follows WHERE follower_id = ? AND following_id = ?",
    [follower_id, following_id],
  );

  return rows[0];
};

const create_follow = async (follower_id, following_id) => {
  await db.query(
    "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
    [follower_id, following_id],
  );
};

const delete_follow = async (follower_id, following_id) => {
  await db.query(
    "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
    [follower_id, following_id],
  );
};

const delete_follow_mutual = async (user1_id, user2_id) => {
  await db.query(
    "DELETE FROM follows WHERE (follower_id = ? AND following_id = ?) OR (follower_id = ? AND following_id = ?)",
    [user1_id, user2_id, user2_id, user1_id],
  );
};

const check_request = async (from_user_id, to_user_id) => {
  const [rows] = await db.query(
    "SELECT * FROM requests WHERE from_user_id = ? AND to_user_id = ?",
    [from_user_id, to_user_id],
  );
  return rows[0];
};

const create_request = async (from_user_id, to_user_id) => {
  await db.query(
    "INSERT INTO requests (from_user_id, to_user_id) VALUES (?, ?)",
    [from_user_id, to_user_id],
  );
};

const delete_request = async (from_user_id, to_user_id) => {
  await db.query(
    "DELETE FROM requests WHERE from_user_id = ? AND to_user_id = ?",
    [from_user_id, to_user_id],
  );
};

const delete_request_mutual = async (user1_id, user2_id) => {
  await db.query(
    "DELETE FROM requests WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)",
    [user1_id, user2_id, user2_id, user1_id],
  );
};
const check_block = async (blocker_id, blocked_id) => {
  const [rows] = await db.query(
    `SELECT EXISTS (
    SELECT 1
    FROM blocks
    WHERE (blocker_id = ? AND blocked_id = ?)
       OR (blocker_id = ? AND blocked_id = ?)
       ) AS is_blocked`,
    [blocker_id, blocked_id, blocked_id, blocker_id],
  );

  return rows[0];
};

const create_block = async (blocker_id, blocked_id) => {
  await db.query("INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)", [
    blocker_id,
    blocked_id,
  ]);
};

const delete_block = async (blocker_id, blocked_id) => {
  await db.query("DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?", [
    blocker_id,
    blocked_id,
  ]);
};

const get_followers = async (user_id, limit = 10, offset = 0) => {
  const [rows] = await db.query(
    "SELECT u.id, u.user_name, u.first_name, u.last_name, p.avatar FROM follows f JOIN users u ON f.follower_id = u.id LEFT JOIN profiles p ON u.id = p.user_id WHERE f.following_id = ? LIMIT ? OFFSET ?",
    [user_id, limit, offset],
  );
  return rows;
};
const get_followers_without_limit = async (user_id) => {
  const [rows] = await db.query(
    `SELECT u.id, u.user_name, u.first_name, u.last_name, p.avatar FROM follows f
     JOIN users u ON f.follower_id = u.id 
     LEFT JOIN profiles p ON u.id = p.user_id 
     WHERE f.following_id = ?`,
    [user_id],
  );
  return rows;
};

const get_following = async (user_id, limit = 10, offset = 0) => {
  const [rows] = await db.query(
   `SELECT u.id, u.user_name, u.first_name, u.last_name, p.avatar FROM follows f
    JOIN users u ON f.following_id = u.id
    LEFT JOIN profiles p ON u.id = p.user_id 
    WHERE f.follower_id = ? LIMIT ? OFFSET ?`, [user_id, limit, offset],
  );
  return rows;
};
const get_following_without_limit = async (user_id) => {
  const [rows] = await db.query(
   `SELECT u.id, u.user_name, u.first_name, u.last_name, p.avatar FROM follows f
    JOIN users u ON f.following_id = u.id
    LEFT JOIN profiles p ON u.id = p.user_id 
    WHERE f.follower_id = ?`, [user_id],
  );
  return rows;
};

const get_pending_requests = async (to_user_id) => {
  const [rows] = await db.query(
    "SELECT u.id, u.user_name, u.first_name, u.last_name, p.avatar FROM requests r JOIN users u ON r.from_user_id = u.id LEFT JOIN profiles p ON u.id = p.user_id WHERE r.to_user_id = ?",
    [to_user_id],
  );
  return rows;
};

module.exports = {
  check_follow,
  create_follow,
  delete_follow,
  delete_follow_mutual,
  check_block,
  create_block,
  delete_block,
  check_request,
  create_request,
  delete_request,
  delete_request_mutual,
  get_followers,
  get_following,
  get_pending_requests,
  get_followers_without_limit,
  get_following_without_limit
};
