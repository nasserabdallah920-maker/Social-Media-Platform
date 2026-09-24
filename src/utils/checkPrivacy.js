const relations_repository = require("../repositories/relations.repositories");
const profile_repository = require("../repositories/profile.repositories");
const AppError = require("./apperror");
const { status_code } = require("./status");

const verify_user_privacy = async (target_user_id, requester_id) => {
  if (String(target_user_id) === String(requester_id)) {
    return true;
  }
  const profile = await profile_repository.find_profile_by_user_id(target_user_id);
  if (profile && profile.is_private) {
    const is_following = await relations_repository.check_follow(requester_id, target_user_id);
    if (!is_following) {
      throw new AppError("This account is private. Follow to see their posts and likes.", status_code.FORBIDDEN);
    }
  }
  return true;
};

module.exports = { verify_user_privacy};