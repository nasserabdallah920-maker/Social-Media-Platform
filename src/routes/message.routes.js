const express = require("express");
const router = express.Router();
const { async_wrapper } = require("../utils/wrapper");
const { protect } = require("../middlewares/auth.middleware");
const message_controllers = require("../controllers/message.controllers");
const { validate } = require("../middlewares/validate.middleware");
const { new_message_schema, update_message_schema } = require("../validators/message.validators");
const uploads = require("../utils/multer");

router.use(protect);

router.post("/new", uploads.single("file"), validate(new_message_schema, "body"), async_wrapper(message_controllers.new_message));
router.post("/new/:conversation_id", uploads.single("file"), validate(new_message_schema, "body"), async_wrapper(message_controllers.new_message));
router.get("/unread/count", async_wrapper(message_controllers.get_unread_messages_count));
router.get("/:conversation_id", async_wrapper(message_controllers.get_conversation_messages));
router.patch("/:message_id", validate(update_message_schema, "body"), async_wrapper(message_controllers.update_message));
router.delete("/:message_id/:conversation_id", async_wrapper(message_controllers.delete_message));

module.exports = router;