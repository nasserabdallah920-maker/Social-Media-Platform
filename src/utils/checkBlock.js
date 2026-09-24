const relations_repository = require("../repositories/relations.repositories");
const AppError = require("./apperror");
const { status_code } = require("./status");

const verify_user_blocking = async (target_user_id, requester_id) => {
  if (String(target_user_id) === String(requester_id)) {
    return true;
  }
  const block_check = await relations_repository.check_block(requester_id, target_user_id);
  if (block_check && block_check.is_blocked) {
    throw new AppError("Cannot access this user due to a block", status_code.FORBIDDEN);
  }
  return true;
};

module.exports = { verify_user_blocking };