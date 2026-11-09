const express = require("express");
const {
  follow,
  unfollow,
  block,
  unblock,
  accept_request,
  reject_request,
  get_followers,
  get_following,
  get_blocked,
  get_pending_requests,
  get_relation_status,
  get_pending_requests_count
} = require("../controllers/relations.controllers");
const { protect } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { async_wrapper } = require("../utils/wrapper");

const router = express.Router();

router.use(protect);

router.post("/follow/:following_id", async_wrapper(follow));
router.post("/unfollow/:following_id", async_wrapper(unfollow));
router.post("/block/:blocked_id", async_wrapper(block));
router.post("/unblock/:blocked_id", async_wrapper(unblock));
router.post("/request/accept/:from_user_id", async_wrapper(accept_request));
router.post("/request/reject/:from_user_id", async_wrapper(reject_request));
router.get("/followers/:user_id", async_wrapper(get_followers));
router.get("/following/:user_id", async_wrapper(get_following));
router.get("/blocked", async_wrapper(get_blocked));
router.get("/status/:user_id", async_wrapper(get_relation_status));
router.get("/requests/pending", async_wrapper(get_pending_requests));
router.get("/requests/pending/count", async_wrapper(get_pending_requests_count));

module.exports = router;