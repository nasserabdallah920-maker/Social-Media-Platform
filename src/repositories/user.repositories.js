const db = require("../config/db.config");

const save_user = async (new_user) => {
  const { user_name, email, password, first_name, last_name } = new_user;
  const [rows] = await db.query(
    `INSERT INTO users (user_name, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)`,
    [user_name, email, password, first_name, last_name],
  );
  const user = { id: rows.insertId, ...new_user };
  return user;
};

const find_user_by_id = async (user_id) => {
  const sql = `SELECT * FROM users WHERE id = ?`;
  const [rows] = await db.query(sql, [user_id]);
  return rows[0];
};

const find_user_by_email = async (email) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  const [rows] = await db.query(sql, [email]);
  return rows[0];
};

const update_user_by_id = async (user_id, new_data) => {
  const fields = Object.keys(new_data);
  const values = Object.values(new_data);

  const sql = `
    UPDATE users
    SET ${fields.map((field) => `${field} = ?`).join(", ")}
    WHERE id = ?
  `;

  values.push(user_id);
  await db.query(sql, values);

  return;
};

const find_refresh_token_by_user_id = async (user_id) => {
  const sql = `SELECT * FROM users WHERE id = ?`;
  const [rows] = await db.query(sql, [user_id]);
  return rows[0].refresh_token;
};

const delete_user_by_id = async (user_id) => {
  const sql = `DELETE FROM users WHERE id = ?`;
  const [result] = await db.query(sql, [user_id]);
  return result;
};

const find_user_details_by_id = async (user_id) => {
  const sql = `
    SELECT 
      u.id, u.user_name, u.first_name, u.last_name, 
      p.avatar, p.bio, p.is_private,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
      (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `;
  const [rows] = await db.query(sql, [user_id]);
  return rows[0];
};

const find_user_by_search = async (search, limit = 10, page = 1) => {
  const skip = (page - 1) * limit;
  const sql = `
    SELECT * FROM users
    WHERE user_name LIKE ?
       OR first_name LIKE ?
       OR last_name LIKE ?
     LIMIT ?
     OFFSET ?
  `;

  const value = `%${search}%`;

  const [rows] = await db.query(sql, [value, value, value, limit, skip]);

  return rows;
};

const search_users = async (search, user_id) => {
  const [rows] = await db.query(
    `
    SELECT 
      users.id,
      users.user_name,
      users.first_name,
      users.last_name,
      profiles.avatar
    FROM users
    LEFT JOIN profiles
      ON profiles.user_id = users.id
    WHERE 
      (
        users.user_name LIKE ?
        OR users.first_name LIKE ?
        OR users.last_name LIKE ?
      )
      AND users.id != ?
      AND NOT EXISTS (
        SELECT 1
        FROM blocks
        WHERE 
          (blocks.blocker_id = ? AND blocks.blocked_id = users.id)
          OR
          (blocks.blocker_id = users.id AND blocks.blocked_id = ?)
      )
    `,
    [
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      user_id,
      user_id,
      user_id,
    ],
  );

  return rows;
};
const find_user_by_username = async (user_name) => {
  const [rows] = await db.query("SELECT * FROM users WHERE user_name = ?", [user_name]);
  return rows[0];
};
module.exports = {
  save_user,
  update_user_by_id,
  find_user_by_email,
  find_user_by_id,
  find_refresh_token_by_user_id,
  find_user_by_search,
  delete_user_by_id,
  find_user_details_by_id,
  search_users,find_user_by_username
};