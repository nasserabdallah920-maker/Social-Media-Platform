const user_services = require("../services/user.services");
const { status_code, status } = require("../utils/status");

const get_user = async (req, res, next) => {
  const user_id = req.params.id;
  const result = await user_services.get_user_by_id(user_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, data: result });
};

const delete_user = async (req, res, next) => {
  const id = req.user.id;
  await user_services.remove_user_by_id(id);
  res.status(status_code.NO_CONTENT).send();
};

const change_user_information = async (req, res, next) => {
  const user_id = req.user.id;
  const body = req.body;
  const change = await user_services.change_user_information(user_id, body);

  res
    .status(status_code.OK)
    .json({ success: status.SUCCESS, data: { user: change } });
};

const change_user_password = async (req, res, next) => {
  const user_id = req.user.id;
  const body = req.body;
  const change = await user_services.change_user_password(user_id, body);

  res
    .status(status_code.OK)
    .json({ success: status.SUCCESS, data: { user: change } });
};

const get_user_details = async (req, res, next) => {
  const user_id = req.params.id;
  const from_user_id = req.user.id;
  const result = await user_services.get_user_details_by_id(user_id, from_user_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, data: result });
};

const search_users = async (req, res, next) => {
  const search = req.query.q || "";
  const user_id = req.user.id;
  const result = await user_services.search_users(search, user_id);
  res.status(status_code.OK).json({ success: status.SUCCESS, data: result });
};

module.exports = {
  get_user,
  delete_user,
  change_user_password,
  change_user_information,
  get_user_details,
  search_users,
};