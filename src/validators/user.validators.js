const { z } = require("zod");

const change_user_info_schema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters").max(50, "First name cannot exceed 50 characters").optional(),
  last_name: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name cannot exceed 50 characters").optional(),
  user_name: z.string().min(3, "Username must be at least 3 characters").max(30, "Username cannot exceed 30 characters").optional(),
});

module.exports = {
  change_user_info_schema,

};