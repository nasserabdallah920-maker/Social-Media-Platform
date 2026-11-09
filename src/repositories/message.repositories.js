const db = require("../config/db.config");

const save_message = async (sender_id, text, conversation_id, file_data) => {
  if (!file_data) {
    const [results] = await db.query(
      `
      INSERT INTO messages (sender_id, text, conversation_id, file_url)
      VALUES (?, ?, ?, NULL)
      `,
      [sender_id, text, conversation_id],
    );
    return results.insertId;
  }

  if (typeof file_data === "string") {
    const [results] = await db.query(
      `
      INSERT INTO messages (sender_id, text, conversation_id, file_url)
      VALUES (?, ?, ?, ?)
      `,
      [sender_id, text, conversation_id, file_data],
    );
    return results.insertId;
  }

  const [results] = await db.query(
    `
    INSERT INTO messages (sender_id, text, conversation_id, file_url, media_type, public_id, file_name, file_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      sender_id,
      text,
      conversation_id,
      file_data.url,
      file_data.media_type || null,
      file_data.public_id || null,
      file_data.file_name || null,
      file_data.file_size || null,
    ],
  );

  return results.insertId;
};

const update_seen_message = async (conversation_id, user_id) => {
  const [results] = await db.query(
    `
    UPDATE messages 
    SET status = ?
    WHERE conversation_id = ? AND sender_id != ?
    `,
    ["seen", conversation_id, user_id],
  );
  return;
};

const update_delivered_message = async (conversation_id, user_id) => {
  const [results] = await db.query(
    `
    UPDATE messages 
    SET status = ?
    WHERE conversation_id = ? AND sender_id != ?
    `,
    ["delivered", conversation_id, user_id],
  );
  return;
};

const get_messages_by_conversation_id = async (
  conversation_id,
  limit,
  offset
) => {
  const [results] = await db.query(
    `
    SELECT 
      messages.*,
      users.user_name AS sender_name,
      profiles.avatar AS sender_avatar
    FROM messages
    LEFT JOIN users ON users.id = messages.sender_id
    LEFT JOIN profiles ON profiles.user_id = messages.sender_id
    WHERE messages.conversation_id = ?
    ORDER BY messages.sent_at DESC
    LIMIT ? OFFSET ?
    `,
    [conversation_id, limit, offset],
  );

  return results;
};

const get_message_by_id = async (message_id) => {
  const [results] = await db.query(
    `SELECT * FROM messages WHERE id = ?`,
    [message_id],
  );
  return results[0];
};

const get_unread_messages_count = async (user_id) => {
  const [results] = await db.query(
    `
    SELECT COUNT(*) as count 
    FROM messages 
    JOIN conversation_members 
    ON messages.conversation_id = conversation_members.conversation_id
    WHERE conversation_members.user_id = ? 
    AND messages.sender_id != ? 
    AND messages.status != 'seen'
    `,
    [user_id, user_id],
  );
  return results[0].count;
};

const update_message_details = async (message_id, text, user_id) => {
  const sql = `
    UPDATE messages
    SET text = ?
    WHERE id = ? AND sender_id = ?
  `;
  const [results] = await db.query(sql, [text, message_id, user_id]);
  return results;
};

const delete_message_by_id = async (message_id, user_id) => {
  const [results] = await db.query(
    `
    DELETE FROM messages
    WHERE id = ? AND sender_id = ?
    `,
    [message_id, user_id],
  );
  return results;
};

module.exports = {
  save_message,
  update_seen_message,
  get_messages_by_conversation_id,
  get_message_by_id,
  update_message_details,
  delete_message_by_id,
  update_delivered_message,
  get_unread_messages_count,
};
