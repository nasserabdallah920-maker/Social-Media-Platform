const express = require("express");
const router = express.Router();
const { async_wrapper } = require("../utils/wrapper");
const { protect } = require("../middlewares/auth.middleware");
const conversation_controllers = require("../controllers/conversation.controllers");
const { validate } = require("../middlewares/validate.middleware");
const {
  create_group_conversation_schema,
  update_group_schema,
  add_members_schema,
} = require("../validators/conversation.validators");
const uploads = require("../utils/multer");

router.use(protect);

router.get("/", async_wrapper(conversation_controllers.get_user_conversations));
router.get("/:conversation_id", async_wrapper(conversation_controllers.get_group_details));

router.post(
  "/creat-group",
  uploads.single("avatar"),
  async_wrapper(conversation_controllers.create_group_conversation)
);
router.post(
  "/create-group",
  uploads.single("avatar"),
  async_wrapper(conversation_controllers.create_group_conversation)
);

router.patch(
  "/:conversation_id",
  uploads.single("avatar"),
  validate(update_group_schema, "body"),
  async_wrapper(conversation_controllers.update_group)
);

router.post(
  "/:conversation_id/members",
  validate(add_members_schema, "body"),
  async_wrapper(conversation_controllers.add_group_members)
);

router.delete(
  "/:conversation_id/members/:member_id",
  async_wrapper(conversation_controllers.remove_group_member)
);

router.post("/direct", async_wrapper(conversation_controllers.create_direct_conversation));
router.post("/direct/:user_id", async_wrapper(conversation_controllers.create_direct_conversation));
router.post("/", async_wrapper(conversation_controllers.create_direct_conversation));
router.delete("/:conversation_id", async_wrapper(conversation_controllers.delete_conversation));

module.exports = router;
