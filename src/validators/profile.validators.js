const { z } = require("zod");

const create_profile_schema = z.object({
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

const update_profile_schema = z.object({
  avatar: z.string().url("Avatar must be a valid URL").optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

module.exports = {
  create_profile_schema,
  update_profile_schema,
};