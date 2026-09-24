const { z } = require("zod");

const create_reply_schema = z.object({
  text: z.string().min(1, "Reply text is required").max(1000, "Reply text cannot exceed 1000 characters"),
  to_user_id: z.string().min(1, "Target user ID is required"),
});

const update_reply_schema = z.object({
  text: z.string().min(1, "Reply text is required").max(1000, "Reply text cannot exceed 1000 characters"),
});

module.exports = {
  create_reply_schema,
  update_reply_schema,
};