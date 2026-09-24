const express = require("express");
const router = express.Router();
const { async_wrapper } = require("../utils/wrapper");
const { validate } = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");
const user_controllers = require("../controllers/user.controllers");
const check_block_middleware = require("../middlewares/checkBlock.middleware");
const { change_user_info_schema } = require("../validators/user.validators");

router.use(protect);
router.get("/get/:id", check_block_middleware, async_wrapper(user_controllers.get_user_details));
router.delete("/delete", async_wrapper(user_controllers.delete_user));

router.patch(
  "/update/info",
  validate(change_user_info_schema, "body"),
  async_wrapper(user_controllers.change_user_information)
);

module.exports = router;