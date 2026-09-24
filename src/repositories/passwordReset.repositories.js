const db = require("../config/db.config");

const add_reset_token = async (user_id, token_hash, expires_at) => {
  const [result] = await db.execute(
    `INSERT INTO password_reset_tokens
     (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [user_id, token_hash, expires_at]
  );

  return result.insertId;
};

const find_reset_token = async (token_hash) => {
  const [rows] = await db.execute(
    `SELECT id, user_id, token_hash, expires_at
     FROM password_reset_tokens
     WHERE token_hash = ?`,
    [token_hash]
  );

  return rows[0];
};

const delete_reset_token = async (token_hash) => {
  const [result] = await db.execute(
    `DELETE FROM password_reset_tokens
     WHERE token_hash = ?`,
    [token_hash]
  );

  return result.affectedRows;
};
const delete_reset_token_by_user_id = async (user_id) => {
  const [result] = await db.execute(
    `DELETE FROM password_reset_tokens
     WHERE user_id = ?`,
    [user_id]
  );

  return result.affectedRows;
};

module.exports = {
  add_reset_token,
  find_reset_token,
  delete_reset_token,
  delete_reset_token_by_user_id
};