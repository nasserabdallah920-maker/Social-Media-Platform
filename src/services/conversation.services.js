const {
  create_conversation,
  check_conversation,
  get_user_conversations: get_user_conversations_repo,
  delete_conversation_by_id,
  check_conversation_member,
  get_conversation_by_id,
  get_conversation_member,
  get_conversation_members,
  add_conversation_member,
  remove_conversation_member,
  update_conversation_details,
} = require("../repositories/conversation.repositories");
const { upload_file_to_cloudinary, delete_from_cloudinary } = require("../utils/cloudinary");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");

const add_conversation = async (users_id, type, options = {}) => {
  let conversation_id;
  const conversation_type = type || "direct";
  
  if (conversation_type === "direct") {
    const results = await check_conversation(users_id, "direct");
    const existing = results && results[0];
    conversation_id = existing ? (existing.id || existing.conversation_id) : null;
  }
  
  if (!conversation_id) {
    conversation_id = await create_conversation(conversation_type, users_id, options);
  }
  return conversation_id;
};

const get_user_conversations = async (user_id, limit, offset) => {
  const conversations = await get_user_conversations_repo(user_id, limit, offset);
  return conversations;
};

const remove_conversation = async (user_id, conversation_id) => {
  const check_member = await check_conversation_member(
    user_id,
    conversation_id,
  );
  if (!check_member) {
    throw new AppError(
      "You cannot delete this conversation because you are not a member of it.",
      status_code.UNAUTHORIZED,
    );
  }
  await delete_conversation_by_id(conversation_id);
};

const update_group_info = async (user_id, conversation_id, name, file = null) => {
  const conversation = await get_conversation_by_id(conversation_id);
  if (!conversation) {
    throw new AppError("Conversation not found", status_code.NOT_FOUND);
  }
  if (conversation.type !== "group") {
    throw new AppError("Only group conversations can be updated", status_code.BAD_REQUEST);
  }

  const member = await get_conversation_member(user_id, conversation_id);
  if (!member) {
    throw new AppError("You are not a member of this group", status_code.FORBIDDEN);
  }
  if (member.role !== "admin") {
    throw new AppError("Only group admins can update group details", status_code.FORBIDDEN);
  }

  const updates = {};
  if (name !== undefined) {
    updates.name = name;
  }

  if (file) {
    const uploaded = await upload_file_to_cloudinary(file, "social_media/groups");
    updates.avatar = uploaded.url;

    if (conversation.avatar) {
      try {
        await delete_from_cloudinary(conversation.avatar, "image");
      } catch (err) {
        console.warn("Could not delete old group avatar:", err.message);
      }
    }
  }

  if (Object.keys(updates).length > 0) {
    await update_conversation_details(conversation_id, updates);
  }

  return await get_conversation_by_id(conversation_id);
};

const add_group_members = async (user_id, conversation_id, new_users = []) => {
  const conversation = await get_conversation_by_id(conversation_id);
  if (!conversation) {
    throw new AppError("Conversation not found", status_code.NOT_FOUND);
  }
  if (conversation.type !== "group") {
    throw new AppError("Only group conversations support adding members", status_code.BAD_REQUEST);
  }

  const member = await get_conversation_member(user_id, conversation_id);
  if (!member) {
    throw new AppError("You are not a member of this group", status_code.FORBIDDEN);
  }
  if (member.role !== "admin") {
    throw new AppError("Only group admins can add members", status_code.FORBIDDEN);
  }

  await Promise.all(
    new_users.map((new_user_id) =>
      add_conversation_member(conversation_id, new_user_id, "member")
    )
  );

  return await get_conversation_members(conversation_id);
};

const remove_group_member = async (user_id, conversation_id, target_user_id) => {
  const conversation = await get_conversation_by_id(conversation_id);
  if (!conversation) {
    throw new AppError("Conversation not found", status_code.NOT_FOUND);
  }
  if (conversation.type !== "group") {
    throw new AppError("Only group conversations support member management", status_code.BAD_REQUEST);
  }

  const isSelf = Number(user_id) === Number(target_user_id);
  const currentMember = await get_conversation_member(user_id, conversation_id);
  if (!currentMember) {
    throw new AppError("You are not a member of this group", status_code.FORBIDDEN);
  }

  if (!isSelf && currentMember.role !== "admin") {
    throw new AppError("Only group admins can remove other members", status_code.FORBIDDEN);
  }

  const targetMember = await get_conversation_member(target_user_id, conversation_id);
  if (!targetMember) {
    throw new AppError("Target user is not a member of this group", status_code.NOT_FOUND);
  }

  await remove_conversation_member(conversation_id, target_user_id);

  const remaining = await get_conversation_members(conversation_id);
  if (!remaining || remaining.length === 0) {
    await delete_conversation_by_id(conversation_id);
  }

  return { conversation_id, removed_user_id: target_user_id };
};

const get_group_details = async (user_id, conversation_id) => {
  const conversation = await get_conversation_by_id(conversation_id);
  if (!conversation) {
    throw new AppError("Conversation not found", status_code.NOT_FOUND);
  }

  const isMember = await check_conversation_member(user_id, conversation_id);
  if (!isMember) {
    throw new AppError("You are not a member of this conversation", status_code.FORBIDDEN);
  }

  const members = await get_conversation_members(conversation_id);
  return {
    ...conversation,
    members,
  };
};

module.exports = {
  add_conversation,
  get_user_conversations,
  remove_conversation,
  update_group_info,
  add_group_members,
  remove_group_member,
  get_group_details,
};
