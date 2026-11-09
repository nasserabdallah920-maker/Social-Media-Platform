const conversation_services = require("../services/conversation.services");
const { status_code, status } = require("../utils/status");

const get_user_conversations = async (req, res, next) => {
  const user_id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const result = await conversation_services.get_user_conversations(user_id, limit, offset);
  const nextPage = result.length < limit ? null : page + 1;
  res.status(status_code.OK).json({ success: status.SUCCESS, data: result, nextPage });
};

const delete_conversation = async (req, res, next) => {
  const conversation_id = req.params.conversation_id;
  const user_id = req.user.id;

  await conversation_services.remove_conversation(user_id, conversation_id);
  res.status(status_code.NO_CONTENT).send();
};

const parse_user_ids = (input) => {
  let list = [];
  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === "string" && (item.startsWith("[") || item.includes(","))) {
        try {
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed)) list.push(...parsed);
          else list.push(item);
        } catch (e) {
          list.push(...item.split(","));
        }
      } else {
        list.push(item);
      }
    }
  } else if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) list = parsed;
      else list = [parsed];
    } catch (e) {
      list = input.split(",");
    }
  } else if (input !== undefined && input !== null) {
    list = [input];
  }

  return list
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
};

const create_direct_conversation = async (req, res, next) => {
  const user_id = req.user.id;
  const other_user_id = req.params.user_id || req.body.user_id || req.body.to_user_id;

  if (!other_user_id) {
    return res.status(status_code.BAD_REQUEST).json({
      success: status.FAIL,
      message: "Recipient user_id is required",
    });
  }

  const conversation_id = await conversation_services.add_conversation([Number(user_id), Number(other_user_id)]);
  res.status(status_code.OK).json({ success: status.SUCCESS, data: { conversation_id } });
};

const create_group_conversation = async (req, res, next) => {
  const user_id = req.user.id;
  const { users, name } = req.body;
  const file = req.file;

  let avatar = null;
  if (file) {
    const { upload_file_to_cloudinary } = require("../utils/cloudinary");
    const uploaded = await upload_file_to_cloudinary(file, "social_media/groups");
    avatar = uploaded.url;
  }

  const userIds = parse_user_ids(users);
  const conversation_id = await conversation_services.add_conversation(
    [...userIds, Number(user_id)],
    "group",
    { name, avatar, creator_id: user_id }
  );

  res.status(status_code.OK).json({
    success: status.SUCCESS,
    data: { conversation_id, name: name || null, avatar },
  });
};

const update_group = async (req, res, next) => {
  const user_id = req.user.id;
  const { conversation_id } = req.params;
  const { name } = req.body;
  const file = req.file;

  const updatedGroup = await conversation_services.update_group_info(
    user_id,
    conversation_id,
    name,
    file
  );

  res.status(status_code.OK).json({
    success: status.SUCCESS,
    data: updatedGroup,
  });
};

const add_group_members = async (req, res, next) => {
  const user_id = req.user.id;
  const { conversation_id } = req.params;
  const { users } = req.body;

  const userIds = parse_user_ids(users);

  const members = await conversation_services.add_group_members(
    user_id,
    conversation_id,
    userIds
  );

  res.status(status_code.OK).json({
    success: status.SUCCESS,
    data: members,
  });
};

const remove_group_member = async (req, res, next) => {
  const user_id = req.user.id;
  const { conversation_id, member_id } = req.params;

  const result = await conversation_services.remove_group_member(
    user_id,
    conversation_id,
    member_id
  );

  res.status(status_code.OK).json({
    success: status.SUCCESS,
    data: result,
  });
};

const get_group_details = async (req, res, next) => {
  const user_id = req.user.id;
  const { conversation_id } = req.params;

  const group = await conversation_services.get_group_details(user_id, conversation_id);

  res.status(status_code.OK).json({
    success: status.SUCCESS,
    data: group,
  });
};

module.exports = {
  get_user_conversations,
  delete_conversation,
  create_direct_conversation,
  create_group_conversation,
  update_group,
  add_group_members,
  remove_group_member,
  get_group_details,
};
