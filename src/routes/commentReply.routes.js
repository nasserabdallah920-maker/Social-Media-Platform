const express = require("express");
const router = express.Router();
const { async_wrapper } = require("../utils/wrapper");
const { protect } = require("../middlewares/auth.middleware");
const comment_reply_controllers = require("../controllers/commentReply.controllers");
const { validate } = require("../middlewares/validate.middleware");
const { create_reply_schema, update_reply_schema } = require("../validators/commentReply.validators");
const uploads = require("../utils/multer");

router.use(protect);

router.post("/create/:comment_id", uploads.single("file"), validate(create_reply_schema, "body"), async_wrapper(comment_reply_controllers.create_reply));
router.get("/comment/:comment_id", async_wrapper(comment_reply_controllers.get_comment_replies));
router.patch("/update/:id", validate(update_reply_schema, "body"), async_wrapper(comment_reply_controllers.update_reply));
router.delete("/delete/:id", async_wrapper(comment_reply_controllers.delete_reply));

module.exports = router;