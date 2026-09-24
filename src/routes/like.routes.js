const express = require("express");
const router = express.Router();
const { async_wrapper } = require("../utils/wrapper");
const { protect } = require("../middlewares/auth.middleware");
const like_controllers = require("../controllers/like.controllers");

router.use(protect);

router.post("/toggle/:post_id", async_wrapper(like_controllers.toggle_like));
router.get("/post/:post_id", async_wrapper(like_controllers.get_post_likes));

module.exports = router;