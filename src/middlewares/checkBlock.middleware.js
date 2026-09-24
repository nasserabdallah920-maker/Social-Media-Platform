const { check_block } = require("../repositories/relations.repositories");
const app_error = require("../utils/apperror");
const { status_code } = require("../utils/status");
const { async_wrapper } = require("../utils/wrapper");

const check_block_middleware = async_wrapper(async (req, res, next) => {
  const target_id = req.params.user_id || req.params.id;
  const user_id = req.user.id;
  if (target_id && user_id) {
    const is_block = await check_block(target_id, user_id);
    if (is_block.is_blocked) {
      throw new app_error(
        "Cannot access. User is blocked.",
        status_code.FORBIDDEN,
      );
    }
  }
  next();
});

module.exports = check_block_middleware;