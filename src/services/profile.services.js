const profile_repository = require("../repositories/profile.repositories");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");
const Redis = require("../config/redis.config");
const { upload_file_to_cloudinary, delete_from_cloudinary } = require("../utils/cloudinary");

const update_profile = async (user_id, data) => {
  const profile = await profile_repository.find_profile_by_user_id(user_id);
  if (!profile) {
    throw new AppError("Profile not found", status_code.NOT_FOUND);
  }
  const updated_profile = await profile_repository.update_profile_by_user_id(user_id, data);
  await Redis.del(`profile:${user_id}`);
  return updated_profile;
};

const toggle_privacy_status = async (user_id) => {
  const profile = await profile_repository.find_profile_by_user_id(user_id);
  if (!profile) {
    throw new AppError("Profile not found", status_code.NOT_FOUND);
  }
  const new_privacy_status = !profile.is_private;
  await profile_repository.update_profile_by_user_id(user_id, {
    is_private: new_privacy_status,
  });
  await Redis.del(`profile:${user_id}`);
  return new_privacy_status;
};

const update_avatar = async (user_id, file) => {
  if (!file) {
    throw new AppError("Avatar image is required", status_code.BAD_REQUEST);
  }
  const old_profile = await profile_repository.find_profile_by_user_id(user_id);
  const uploaded = await upload_file_to_cloudinary(file, "social_media/avatars");
  const avatar_url = uploaded.url;

  if (old_profile && old_profile.avatar) {
    try {
      await delete_from_cloudinary(old_profile.avatar, "image");
    } catch (err) {
      console.warn("Could not remove old avatar:", err.message);
    }
  }

  return await update_profile(user_id, { avatar: avatar_url });
};

module.exports = {
  update_profile,
  toggle_privacy_status,
  update_avatar,
};
