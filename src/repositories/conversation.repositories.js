const db = require("../config/db.config");

const create_conversation = async (type, users_id) => {
  const [results] = await db.query(
    `
    INSERT INTO conversations (type)
    VALUES (?)
    `,
    [type],
  );

  const conversation_id = results.insertId;

  await Promise.all(
    users_id.map((user_id) =>
      db.query(
        `
        INSERT INTO conversation_members (conversation_id, user_id)
        VALUES (?, ?)
        `,
        [conversation_id, user_id],
      ),
    ),
  );

  return conversation_id;
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

const get_user_conversations = async (user_id) => {
  const [results] = await db.query(
    `
SELECT 
    conversations.*,
    profiles.avatar,
    users.user_name,
    messages.text,
    messages.sent_at,
    messages.sender_id,

    (
        SELECT COUNT(*)
        FROM messages
        WHERE messages.status != 'seen'
        AND messages.conversation_id = conversations.id
        AND messages.sender_id != ?
    ) AS unreaded

FROM conversations

JOIN conversation_members
    ON conversation_members.conversation_id = conversations.id

JOIN profiles
    ON conversation_members.user_id = profiles.user_id

JOIN users
    ON users.id = conversation_members.user_id

JOIN messages
    ON messages.id = (
        SELECT messages.id
        FROM messages
        WHERE messages.conversation_id = conversation_members.conversation_id
        ORDER BY sent_at DESC
        LIMIT 1
    )

WHERE conversations.id IN (
    SELECT conversation_id
    FROM conversation_members
    WHERE user_id = ?
)
AND conversation_members.user_id != ?;
    `,
    [user_id, user_id, user_id],
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
  
  return results.length>0?true:false;
};
module.exports = {
  create_conversation,
  check_conversation,
  get_other_users_id,
  get_user_conversations,
  delete_conversation_by_id,
  get_conversation_by_id,
  check_conversation_member
};
