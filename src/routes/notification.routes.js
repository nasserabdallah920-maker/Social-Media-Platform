const express = require("express");

const router = express.Router();

const {
  get_all_notifications,
  get_unread,
  read_all,
  read_one,
  delete_notification,
  get_all_unreaded_notifications
} = require("../controllers/notifications.controllers"); 

const { protect } = require("../middlewares/auth.middleware");
const { async_wrapper } = require("../utils/wrapper");

router.use(protect);

router.get("/", async_wrapper(get_all_notifications));

router.get("/unreaded", async_wrapper(get_all_unreaded_notifications));

router.patch("/read-all", async_wrapper(read_all));

router.get("/unread-count", async_wrapper(get_unread));

router.patch("/:id/read", async_wrapper(read_one));

router.delete("/:id", async_wrapper(delete_notification));

module.exports = router;