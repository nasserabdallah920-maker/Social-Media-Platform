const db = require("../config/db.config");

const create_conversation = async (type, users_id, options = {}) => {
  const connection = await db.getConnection();

  try {
    const name = options.name ?? null;
    const avatar = options.avatar ?? null;
    const creator_id = Number(
      options.creator_id ?? users_id[users_id.length - 1],
    );

    users_id = [...new Set(users_id.map(Number))];

    if (!users_id.length) {
      throw new Error("Conversation must have at least one member");
    }

    if (type === "group" && !users_id.includes(creator_id)) {
      throw new Error("Creator must be a conversation member");
    }

    await connection.beginTransaction();

    const [results] = await connection.query(
      `
      INSERT INTO conversations (type, name, avatar)
      VALUES (?, ?, ?)
      `,
      [type, name, avatar],
    );

    const conversation_id = results.insertId;

    await Promise.all(
      users_id.map((user_id) => {
        const role =
          type === "group" && user_id === creator_id
            ? "admin"
            : "member";

        return connection.query(
          `
          INSERT INTO conversation_members (conversation_id, user_id, role)
          VALUES (?, ?, ?)
          `,
          [conversation_id, user_id, role],
        );
      }),
    );

    await connection.commit();

    return conversation_id;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const check_conversation = async (users, type) => {
  const [results] = await db.query(
    `
        SELECT conversations.* FROM conversations 
        JOIN conversation_members 
        ON conversation_members.conversation_id = conversations.id
        WHERE conversation_members.user_id IN (${"?".repeat(users.length).split("").join(",")}) AND conversations.type = ?
        GROUP BY conversations.id
        HAVING COUNT(DISTINCT conversation_members.user_id) = ${users.length}
        `,
    [...users, type],
  );
  return results;
};

const get_other_users_id = async (conversation_id, user_id) => {
  const [results] = await db.query(
    `
select user_id from conversation_members 
where user_id not in (?) and conversation_id = ?
        `,
    [user_id, conversation_id],
  );

  return results;
};

const get_user_conversations = async (user_id, limit, offset) => {
  const [results] = await db.query(
    `
SELECT 
    conversations.id,
    conversations.type,
    IF(conversations.type = 'group', conversations.name, other_users.user_name) AS name,
    IF(conversations.type = 'group', conversations.avatar, other_profiles.avatar) AS avatar,
    conversations.created_at,
    IF(conversations.type = 'group', NULL, other_users.id) AS user_id,
    IF(conversations.type = 'group', NULL, other_users.user_name) AS user_name,
    last_message.text,
    last_message.file_url,
    last_message.media_type,
    last_message.file_name,
    last_message.file_size,
    last_message.sent_at,
    last_message.sender_id,
    COALESCE(unread.unread_count, 0) AS unreaded

FROM conversations

JOIN conversation_members cm
    ON cm.conversation_id = conversations.id
    AND cm.user_id = ?

LEFT JOIN conversation_members other_cm
    ON other_cm.conversation_id = conversations.id
    AND other_cm.user_id != ?
    AND conversations.type = 'direct'

LEFT JOIN users other_users
    ON other_users.id = other_cm.user_id

LEFT JOIN profiles other_profiles
    ON other_profiles.user_id = other_cm.user_id

LEFT JOIN (
    SELECT m.*
    FROM messages m
    INNER JOIN (
        SELECT conversation_id, MAX(id) AS max_id
        FROM messages
        GROUP BY conversation_id
    ) latest ON m.id = latest.max_id
) last_message ON last_message.conversation_id = conversations.id

LEFT JOIN (
    SELECT conversation_id, COUNT(*) AS unread_count
    FROM messages
    WHERE status != 'seen' AND sender_id != ?
    GROUP BY conversation_id
) unread ON unread.conversation_id = conversations.id

ORDER BY COALESCE(last_message.sent_at, conversations.created_at) DESC
LIMIT ? OFFSET ?;
    `,
    [user_id, user_id, user_id, limit, offset],
  );
  return results;
};

const delete_conversation_by_id = async (conversation_id) => {
  const [results] = await db.query(
    `
    DELETE FROM conversations
    WHERE id = ?
    `,
    [conversation_id],
  );
  return results;
};

const get_conversation_by_id = async (conversation_id) => {
  const [results] = await db.query(
    `
    SELECT * FROM conversations
    WHERE id = ?
    `,
    [conversation_id],
  );
  return results[0];
};

const check_conversation_member = async (user_id, conversation_id) => {
  const [results] = await db.query(
    `
    select user_id from conversation_members where user_id = ? and conversation_id = ?
    `,
    [user_id, conversation_id],
  );
  
  return results.length > 0 ? true : false;
};

const get_conversation_member = async (user_id, conversation_id) => {
  const [results] = await db.query(
    `
    SELECT * FROM conversation_members WHERE user_id = ? AND conversation_id = ?
    `,
    [user_id, conversation_id],
  );
  return results[0];
};

const get_conversation_members = async (conversation_id) => {
  const [results] = await db.query(
    `
    SELECT 
      conversation_members.user_id,
      conversation_members.role,
      users.user_name,
      users.first_name,
      users.last_name,
      profiles.avatar
    FROM conversation_members
    JOIN users ON users.id = conversation_members.user_id
    LEFT JOIN profiles ON profiles.user_id = conversation_members.user_id
    WHERE conversation_members.conversation_id = ?
    `,
    [conversation_id],
  );
  return results;
};

const add_conversation_member = async (conversation_id, user_id, role = "member") => {
  const [results] = await db.query(
    `
    INSERT INTO conversation_members (conversation_id, user_id, role)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE role = VALUES(role)
    `,
    [conversation_id, user_id, role],
  );
  return results;
};

const remove_conversation_member = async (conversation_id, user_id) => {
  const [results] = await db.query(
    `
    DELETE FROM conversation_members
    WHERE conversation_id = ? AND user_id = ?
    `,
    [conversation_id, user_id],
  );
  return results;
};

const update_conversation_details = async (conversation_id, fields = {}) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return;

  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  const values = [...Object.values(fields), conversation_id];

  const [results] = await db.query(
    `
    UPDATE conversations
    SET ${setClause}
    WHERE id = ?
    `,
    values,
  );
  return results;
};

module.exports = {
  create_conversation,
  check_conversation,
  get_other_users_id,
  get_user_conversations,
  delete_conversation_by_id,
  get_conversation_by_id,
  check_conversation_member,
  get_conversation_member,
  get_conversation_members,
  add_conversation_member,
  remove_conversation_member,
  update_conversation_details,
};
