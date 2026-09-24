const express = require("express");
const router = express.Router();
const { async_wrapper } = require("../utils/wrapper");
const { protect } = require("../middlewares/auth.middleware");
const comment_controllers = require("../controllers/comment.controllers");
const { validate } = require("../middlewares/validate.middleware");
const { create_comment_schema, update_comment_schema } = require("../validators/comment.validators");
const uploads = require("../utils/multer");

router.use(protect);

router.post("/create/:post_id", uploads.single("file"), validate(create_comment_schema, "body"), async_wrapper(comment_controllers.create_comment));
router.get("/post/:post_id", async_wrapper(comment_controllers.get_post_comments));
router.patch("/update/:id", validate(update_comment_schema, "body"), async_wrapper(comment_controllers.update_comment));
router.delete("/delete/:id", async_wrapper(comment_controllers.delete_comment));

module.exports = router;