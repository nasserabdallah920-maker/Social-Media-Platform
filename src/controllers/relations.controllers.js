const relations_service = require("../services/relations.services");
const { status_code, status } = require("../utils/status");

const follow = async (req, res, next) => {
  const follower_id = req.user.id;
  const { following_id } = req.params;
  const message = await relations_service.follow_user(follower_id, following_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, message });
};

const unfollow = async (req, res, next) => {
  const follower_id = req.user.id;
  const { following_id } = req.params;

  const message = await relations_service.unfollow_user(follower_id, following_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, message });
};

const block = async (req, res, next) => {
  const blocker_id = req.user.id;
  const { blocked_id } = req.params;

  await relations_service.block_user(blocker_id, blocked_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, message: "User blocked successfully" });
};

const unblock = async (req, res, next) => {
  const blocker_id = req.user.id;
  const { blocked_id } = req.params;

  await relations_service.unblock_user(blocker_id, blocked_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, message: "User unblocked successfully" });
};

const accept_request = async (req, res, next) => {
  const to_user_id = req.user.id;
  const { from_user_id } = req.params;

  await relations_service.accept_request(to_user_id, from_user_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, message: "Follow request accepted successfully" });
};

const reject_request = async (req, res, next) => {
  const to_user_id = req.user.id;
  const { from_user_id } = req.params;

  await relations_service.reject_request(to_user_id, from_user_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, message: "Follow request rejected successfully" });
};

const get_followers = async (req, res, next) => {
  const { user_id } = req.params;
  const requester_id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const followers = await relations_service.get_user_followers(user_id, limit, offset, requester_id);
  const nextPage = followers.length < limit ? null : page + 1;
  res.status(status_code.OK).json({ success: status.SUCCESS, data: followers, nextPage });
};

const get_following = async (req, res, next) => {
  const { user_id } = req.params;
  const requester_id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const following = await relations_service.get_user_following(user_id, limit, offset, requester_id);
  const nextPage = following.length < limit ? null : page + 1;
  res.status(status_code.OK).json({ success: status.SUCCESS, data: following, nextPage });
};

const get_blocked = async (req, res, next) => {
  const blocker_id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const blocked_users = await relations_service.get_blocked_users(blocker_id, limit, offset);
  const nextPage = blocked_users.length < limit ? null : page + 1;
  res.status(status_code.OK).json({ success: status.SUCCESS, data: blocked_users, nextPage });
};

const get_relation_status = async (req, res, next) => {
  const current_user_id = req.user.id;
  const { user_id } = req.params;
  const status_data = await relations_service.get_relation_status(current_user_id, user_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, data: status_data });
};

const get_pending_requests = async (req, res, next) => {
  const user_id = req.user.id;
  const requests = await relations_service.get_pending_requests(user_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, data: requests });
};

const get_pending_requests_count = async (req, res, next) => {
  const user_id = req.user.id;
  const count = await relations_service.get_pending_requests_count(user_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, data: { count } });
};

module.exports = {
  follow,
  unfollow,
  block,
  unblock,
  accept_request,
  reject_request,
  get_followers,
  get_following,
  get_blocked,
  get_relation_status,
  get_pending_requests,
  get_pending_requests_count,
};