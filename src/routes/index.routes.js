const express = require("express");
const router = express.Router();
const auth_router = require("./auth.routes");
const profile_router = require("./profiles.routes");
const relations_router = require("./relations.routes");
const users_router = require("./user.routes");
const posts_router = require("./post.routes");
const likes_router = require("./like.routes");
const comments_router = require("./comment.routes");
const comment_reply_router = require("./commentReply.routes");
const feed_router = require("./feed.routes");
const messages_router = require("./message.routes");
const conversation_router = require("./conversation.routes");
const notification_router = require("./notification.routes");

router.use("/auth", auth_router);
router.use("/profiles", profile_router);
router.use("/relations", relations_router);
router.use("/users", users_router);
router.use("/posts", posts_router);
router.use("/likes", likes_router);
router.use("/comments", comments_router);
router.use("/replies", comment_reply_router);
router.use("/feed", feed_router);
router.use("/messages", messages_router);
router.use("/conversations", conversation_router);
router.use("/notifications", notification_router);

module.exports = router;