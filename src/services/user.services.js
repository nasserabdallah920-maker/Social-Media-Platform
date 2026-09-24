const user_repository = require("../repositories/user.repositories");
const AppError = require("../utils/apperror");
const { verify_password, hash_password } = require("../utils/bcrypt");
const { status_code } = require("../utils/status");
const Redis = require("../config/redis.config");
const { verify_user_blocking } = require("../utils/checkBlock");
const { verify_user_privacy } = require("../utils/checkPrivacy");
const get_user_by_id = async (user_id) => {
  const caching_user = await Redis.get(`user:${user_id}`);
  if (caching_user) {
    return JSON.parse(caching_user);
  }
  const user = await user_repository.find_user_by_id(user_id);
  if (!user) {
    throw new AppError("This user does not exist", status_code.NOT_FOUND);
  }
  await Redis.set(`user:${user_id}`, JSON.stringify(user), { EX: 60 * 5 });
  return user;
};

const get_user_details_by_id = async (user_id, from_user_id) => {
  const user = await user_repository.find_user_details_by_id(user_id);
  if (!user) {
    throw new AppError("This user does not exist", status_code.NOT_FOUND);
  }
  if (from_user_id) {
    await verify_user_blocking(user_id, from_user_id);
    await verify_user_privacy(user_id, from_user_id);
  }
  return user;
};

const remove_user_by_id = async (user_id) => {
  const user = await user_repository.find_user_by_id(user_id);
  if (!user) {
    throw new AppError("This user does not exist", status_code.NOT_FOUND);
  }
  await user_repository.delete_user_by_id(user_id);
  await Redis.del(`user:${user_id}`);
  return;
};

const change_user_information = async (user_id, body) => {
  const user = await user_repository.find_user_by_id(user_id);
  const new_information = body;
  if (!user) {
    throw new AppError("This user does not exist", status_code.NOT_FOUND);
  }
  const update = await user_repository.update_user_by_id(
    user_id,
    new_information,
  );
  await Redis.del(`user:${user_id}`);
  return update;
};

const change_user_password = async (user_id, body) => {
  const { old_password, new_password } = body;
  const user = await user_repository.find_user_by_id(user_id);

  if (!user) {
    throw new AppError("This user does not exist", status_code.NOT_FOUND);
  }
  const verify = await verify_password(old_password, user.password);

  if (!verify) {
    throw new AppError(
      "The old password is incorrect.",
      status_code.BAD_REQUEST,
    );
  }
  const hash_new_password = await hash_password(new_password);
  const update = await user_repository.update_user_by_id(user_id, {
    password: hash_new_password,
  });
  await Redis.del(`user:${user_id}`);
  return update;
};

const search_users = async (search, user_id) => {
  const users = await user_repository.search_users(search, user_id);
  return users;
};

module.exports = {
  get_user_by_id,
  remove_user_by_id,
  get_user_details_by_id,
  change_user_information,
  change_user_password,
  search_users,
};
