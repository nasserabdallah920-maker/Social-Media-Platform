const { z } = require("zod");

const register_schema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters").max(50, "First name cannot exceed 50 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name cannot exceed 50 characters"),
  user_name: z.string().min(3, "Username must be at least 3 characters").max(30, "Username cannot exceed 30 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const login_schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const change_password_schema = z.object({
  old_password: z.string().min(1, "Old password is required"),
  new_password: z.string().min(6, "New password must be at least 6 characters"),
});

const reset_password_schema = z.object({
  new_password: z.string().min(6, "New password must be at least 6 characters"),
  confirm_password: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

const reset_email_schema = z.object({
  email: z.string().email("Invalid email address"),
});

module.exports = {
  register_schema,
  login_schema,
  change_password_schema,
  reset_password_schema,
  reset_email_schema,
};