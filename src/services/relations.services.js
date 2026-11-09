const relations_repository = require("../repositories/relations.repositories");
const profile_repository = require("../repositories/profile.repositories");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");
const {
  create_notification,
} = require("../repositories/notification.repositories");
const { get_io } = require("../socket/socketManager");
const {
  find_user_by_id,
  find_user_details_by_id,
} = require("../repositories/user.repositories");
const { sent_follow_notification } = require("./notifications.services");
const { get_user_details_by_id } = require("./user.services");
const { verify_user_blocking } = require("../utils/checkBlock");
const { verify_user_privacy } = require("../utils/checkPrivacy");

const follow_user = async (follower_id, following_id) => {
  if (String(follower_id) === String(following_id)) {
    throw new AppError("You cannot follow yourself", status_code.BAD_REQUEST);
  }

  await verify_user_blocking(following_id, follower_id);

  const existing_follow = await relations_repository.check_follow(
    follower_id,
    following_id,
  );
  if (existing_follow) {
    throw new AppError(
      "You are already following this user",
      status_code.BAD_REQUEST,
    );
  }
  const profile =
    await profile_repository.find_profile_by_user_id(following_id);
  const user = await find_user_details_by_id(follower_id);
  if (profile && profile.is_private) {
    const existing_request = await relations_repository.check_request(
      follower_id,
      following_id,
    );
    if (existing_request) {
      throw new AppError(
        "You have already sent a follow request",
        status_code.BAD_REQUEST,
      );
    }
    await relations_repository.create_request(follower_id, following_id);
    await sent_follow_notification(
      following_id,
      follower_id,
      "follow_request",
      user,
    );
    return "Follow request sent successfully";
  } else {
    await relations_repository.create_follow(follower_id, following_id);
    await sent_follow_notification(following_id, follower_id, "follow", user);
    return "User followed successfully";
  }
};

const unfollow_user = async (follower_id, following_id) => {
  const existing_request = await relations_repository.check_request(
    follower_id,
    following_id,
  );
  if (existing_request) {
    await relations_repository.delete_request(follower_id, following_id);
    return "Follow request cancelled successfully";
  }

  const existing_follow = await relations_repository.check_follow(
    follower_id,
    following_id,
  );
  if (!existing_follow) {
    throw new AppError(
      "You are not following this user and have no pending requests",
      status_code.BAD_REQUEST,
    );
  }

  await relations_repository.delete_follow(follower_id, following_id);
  return "User unfollowed successfully";
};

const block_user = async (blocker_id, blocked_id) => {
  if (String(blocker_id) === String(blocked_id)) {
    throw new AppError("You cannot block yourself", status_code.BAD_REQUEST);
  }

  const existing_block = await relations_repository.check_block(
    blocker_id,
    blocked_id,
  );

  if (existing_block.is_blocked) {
    throw new AppError(
      "You have already blocked this user",
      status_code.BAD_REQUEST,
    );
  }

  await relations_repository.create_block(blocker_id, blocked_id);

  await relations_repository.delete_follow_mutual(blocker_id, blocked_id);
  await relations_repository.delete_request_mutual(blocker_id, blocked_id);
};

const unblock_user = async (blocker_id, blocked_id) => {
  const existing_block = await relations_repository.check_block(
    blocker_id,
    blocked_id,
  );
  if (!existing_block.is_blocked) {
    throw new AppError(
      "You have not blocked this user",
      status_code.BAD_REQUEST,
    );
  }
  await relations_repository.delete_block(blocker_id, blocked_id);
};

const accept_request = async (to_user_id, from_user_id) => {
  const request = await relations_repository.check_request(
    from_user_id,
    to_user_id,
  );
  if (!request) {
    throw new AppError("Follow request not found", status_code.NOT_FOUND);
  }

  const user = await find_user_details_by_id(to_user_id);

  await relations_repository.create_follow(from_user_id, to_user_id);
  await relations_repository.delete_request(from_user_id, to_user_id);

  await sent_follow_notification(
    from_user_id,
    to_user_id,
    "follow_accept",
    user,
  );
};

const reject_request = async (to_user_id, from_user_id) => {
  const request = await relations_repository.check_request(
    from_user_id,
    to_user_id,
  );
  if (!request) {
    throw new AppError("Follow request not found", status_code.NOT_FOUND);
  }
  await relations_repository.delete_request(from_user_id, to_user_id);
};

const get_user_followers = async (user_id, limit, offset, requester_id = null) => {
  if (limit < 10 || limit > 100) {
    throw new AppError(
      "The limit must be at least 10 or at most 100.",
      status_code.BAD_REQUEST,
    );
  }
  if (requester_id) {
    await verify_user_blocking(user_id, requester_id);
    await verify_user_privacy(user_id, requester_id);
  }
  return await relations_repository.get_followers(user_id, limit, offset);
};

const get_user_following = async (user_id, limit, offset, requester_id = null) => {
  if (limit < 10 || limit > 100) {
    throw new AppError(
      "The limit must be at least 10 or at most 100.",
      status_code.BAD_REQUEST,
    );
  }
  if (requester_id) {
    await verify_user_blocking(user_id, requester_id);
    await verify_user_privacy(user_id, requester_id);
  }
  return await relations_repository.get_following(user_id, limit, offset);
};

const get_relation_status = async (current_user_id, target_user_id) => {
  const is_following = await relations_repository.check_follow(
    current_user_id,
    target_user_id,
  );
  const is_blocked = await relations_repository.check_block(
    current_user_id,
    target_user_id,
  );
  const follow_request_pending = await relations_repository.check_request(
    current_user_id,
    target_user_id,
  );

  return {
    is_following: !!is_following,
    is_blocked: !!(is_blocked && is_blocked.is_blocked),
    follow_request_pending: !!follow_request_pending,
  };
};

const get_blocked_users = async (blocker_id, limit, offset) => {
  if (limit < 10 || limit > 100) {
    throw new AppError(
      "The limit must be at least 10 or at most 100.",
      status_code.BAD_REQUEST,
    );
  }
  return await relations_repository.get_blocked_users(blocker_id, limit, offset);
};

const get_pending_requests = async (user_id) => {
  return await relations_repository.get_pending_requests(user_id);
};

const get_pending_requests_count = async (user_id) => {
  return await relations_repository.get_pending_requests_count(user_id);
};

module.exports = {
  follow_user,
  unfollow_user,
  block_user,
  unblock_user,
  accept_request,
  reject_request,
  get_user_followers,
  get_user_following,
  get_blocked_users,
  get_relation_status,
  get_pending_requests,
  get_pending_requests_count,
};
