const profile_service = require("../services/profile.services");
const { status_code, status } = require("../utils/status");
const app_error = require("../utils/apperror");

const update_profile = async (req, res, next) => {
  const user_id = req.user.id;
  const { bio } = req.body;
  await profile_service.update_profile(user_id, { bio });
  res
    .status(status_code.OK)
    .json({ success: status.SUCCESS, message: "Profile updated successfully" });
};

const update_avatar = async (req, res, next) => {
  const user_id = req.user.id;
  const avatar = req.file;
  await profile_service.update_avatar(user_id, avatar);
  res
    .status(status_code.OK)
    .json({ success: status.SUCCESS, message: "Profile updated successfully" });
};


const toggle_privacy = async (req, res, next) => {
  const user_id = req.user.id;
  const new_privacy_status = await profile_service.toggle_privacy_status(user_id);
  
  res
    .status(status_code.OK)
    .json({ 
      success: status.SUCCESS, 
      message: "Privacy status updated successfully", 
      data: { is_private: new_privacy_status } 
    });
};

module.exports = {
  update_profile,
  update_avatar,
  toggle_privacy,
};