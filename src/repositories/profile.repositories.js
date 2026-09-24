const db = require("../config/db.config");

const save_profile = async (new_profile) => {
  const { avatar, bio, user_id } = new_profile;
  const [rows] = await db.query(
    `INSERT INTO profiles (avatar, bio, user_id) VALUES (?, ?, ?)`,
    [avatar, bio, user_id],
  );
  const profile = { id: rows.insertId, ...new_profile };
  return profile;
};

const find_profile_by_user_id = async (user_id) => {
  const sql = `
    SELECT *
    FROM profiles
    INNER JOIN users
    ON profiles.user_id = users.id
    WHERE profiles.user_id = ?;
  `;
  const [rows] = await db.query(sql, [user_id]);
  return rows[0];
};

const update_profile_by_user_id = async (user_id, new_data) => {
  const fields = Object.keys(new_data);
  const values = Object.values(new_data);

  if (fields.length === 0) return;

  const sql = `
    UPDATE profiles
    SET ${fields.map((field) => `${field} = ?`).join(", ")}
    WHERE user_id = ?
  `;

  values.push(user_id);
  await db.query(sql, values);

  return;
};


module.exports = {
  save_profile,
  find_profile_by_user_id,
  update_profile_by_user_id,

};