const { z } = require("zod");

const create_group_conversation_schema = z.object({
  name: z.string().min(1, "Group name cannot be empty").max(255, "Group name cannot exceed 255 characters").optional(),
  users: z
    .array(z.coerce.number().positive())
    .min(2, "A group conversation requires at least 2 other users"),
});

const update_group_schema = z.object({
  name: z.string().min(1, "Group name cannot be empty").max(255, "Group name cannot exceed 255 characters").optional(),
});

const add_members_schema = z.object({
  users: z
    .array(z.coerce.number().positive())
    .min(1, "Must provide at least one user to add"),
});

module.exports = {
  create_group_conversation_schema,
  update_group_schema,
  add_members_schema,
};
