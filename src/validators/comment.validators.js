const { z } = require("zod");

const create_comment_schema = z.object({
  text: z.string().max(1000, "Comment text cannot exceed 1000 characters").optional(),
});

const update_comment_schema = z.object({
  text: z.string().min(1, "Comment text is required").max(1000, "Comment text cannot exceed 1000 characters"),
});

module.exports = {
  create_comment_schema,
  update_comment_schema,
};