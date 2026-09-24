const express = require("express");
const router = express.Router();
const { async_wrapper } = require("../utils/wrapper");
const { protect } = require("../middlewares/auth.middleware");
const post_controllers = require("../controllers/post.controllers");
const { validate } = require("../middlewares/validate.middleware");
const { create_post_schema, update_post_schema, delete_post_file_schema } = require("../validators/post.validators");
const uploads = require("../utils/multer");
const check_block_middleware = require("../middlewares/checkBlock.middleware");

router.use(protect);

router.post("/create", uploads.array("post_files"), validate(create_post_schema, "body"), async_wrapper(post_controllers.create_post));
router.get("/user/:user_id", check_block_middleware, async_wrapper(post_controllers.get_user_posts));
router.get("/:id", async_wrapper(post_controllers.get_post));
router.patch("/update/:id", validate(update_post_schema, "body"), async_wrapper(post_controllers.update_post));
router.patch("/update/files/:id", uploads.array('post_files'), async_wrapper(post_controllers.post_new_files));
router.delete("/delete/:id", async_wrapper(post_controllers.delete_post));
router.delete("/delete/:id/file", validate(delete_post_file_schema, "body"), async_wrapper(post_controllers.delete_post_file));

module.exports = router;