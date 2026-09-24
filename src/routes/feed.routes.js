const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { feed_posts, search } = require("../controllers/feed.controllers");
const { async_wrapper } = require("../utils/wrapper");

router.use(protect);
router.get("/posts", async_wrapper(feed_posts));
router.get("/", async_wrapper(search));

module.exports = router;