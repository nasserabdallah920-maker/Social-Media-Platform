const express = require("express");
const router = express.Router();
const { async_wrapper } = require("../utils/wrapper");
const { protect } = require("../middlewares/auth.middleware");
const conversation_controllers = require("../controllers/conversation.controllers");
const { validate } = require("../middlewares/validate.middleware");
const { create_group_conversation_schema } = require("../validators/conversation.validators");

router.use(protect);

router.get("/", async_wrapper(conversation_controllers.get_user_conversations));
router.post('/creat-group', validate(create_group_conversation_schema, "body"), async_wrapper(conversation_controllers.create_group_conversation))
router.post("/direct/:user_id", async_wrapper(conversation_controllers.create_direct_conversation));
router.delete("/:conversation_id", async_wrapper(conversation_controllers.delete_conversation));

module.exports = router;