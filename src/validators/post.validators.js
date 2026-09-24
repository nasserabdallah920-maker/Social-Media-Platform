const { z } = require("zod");

const create_post_schema = z.object({
  text: z.string().max(1000, "Post text cannot exceed 1000 characters").optional(),
});

const update_post_schema = z.object({
  text: z.string().min(1, "Post text is required").max(1000, "Post text cannot exceed 1000 characters"),
});

const delete_post_file_schema = z.object({
  file_url: z.string().url("File URL must be a valid URL"),
});

module.exports = {
  create_post_schema,
  update_post_schema,
  delete_post_file_schema,
};