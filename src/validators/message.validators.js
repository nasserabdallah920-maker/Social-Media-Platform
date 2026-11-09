const { z } = require("zod");

const new_message_schema = z.object({
  text: z.string().max(2000, "Message text cannot exceed 2000 characters").optional(),
  to_user_id: z.any(),
  conversation_type: z.string(),
});
const update_message_schema = z.object({
  text: z.string().min(1, "Message text is required").max(2000, "Message text cannot exceed 2000 characters"),
});

module.exports = {
  new_message_schema,
  update_message_schema,
};