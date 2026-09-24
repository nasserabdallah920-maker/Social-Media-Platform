const express = require("express");
const router = express.Router();
const auth_controllers = require("../controllers/auth.controllers");
const { validate } = require("../middlewares/validate.middleware");
const schemas = require("../validators/auth.validators");
const { async_wrapper } = require("../utils/wrapper");
const { protect } = require("../middlewares/auth.middleware");

router.post(
  "/register",
  validate(schemas.register_schema, "body"),
  async_wrapper(auth_controllers.create_user),
);
router.post(
  "/login",
  validate(schemas.login_schema, "body"),
  async_wrapper(auth_controllers.login),
);
router.post("/logout", protect, async_wrapper(auth_controllers.log_out));
router.post("/refresh", async_wrapper(auth_controllers.refresh));
router.post(
  "/change/password",
  protect,
  validate(schemas.change_password_schema, "body"),
  async_wrapper(auth_controllers.change_user_password),
);
router.post(
  "/reset/password",
  validate(schemas.reset_password_schema, "body"),
  async_wrapper(auth_controllers.reset_user_password),
);
router.post(
  "/reset/email",
  validate(schemas.reset_email_schema, "body"),
  async_wrapper(auth_controllers.reset_user_sent_mail),
);

module.exports = router;