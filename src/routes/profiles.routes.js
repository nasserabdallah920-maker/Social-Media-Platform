const express = require("express");
const {
  get_profile,
  get_my_profile,
  update_profile,
  delete_profile,
  update_avatar,
  update_cover,
  toggle_privacy,
} = require("../controllers/profile.controllers");
const { protect } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { update_profile_schema } = require("../validators/profile.validators");
const uploads = require("../utils/multer");
const {} = require("../middlewares/checkBlock.middleware");
const { async_wrapper } = require("../utils/wrapper");

const router = express.Router();

router.use(protect);
router.put("/bio", validate(update_profile_schema, "body"), async_wrapper(update_profile));
router.put("/avatar",uploads.single("avatar"), async_wrapper(update_avatar));
router.patch("/privacy", async_wrapper(toggle_privacy));

module.exports = router;