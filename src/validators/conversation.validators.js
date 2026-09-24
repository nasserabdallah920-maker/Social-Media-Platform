const { z } = require("zod");

const create_group_conversation_schema = z.object({
  users: z
    .array(z.string().min(1, "User ID cannot be empty"))
    .min(2, "A group conversation requires at least 2 other users"),
});

module.exports = {
  create_group_conversation_schema,
};
