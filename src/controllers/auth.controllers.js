const { status_code, status } = require("../utils/status");
const auth_services = require("../services/auth.services");

const cookie_options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
const create_user = async (req, res, next) => {
  const{ first_name, last_name, email, password, user_name }= req.body;
  const result = await auth_services.add_user({ first_name, last_name, email, password, user_name });
  res
    .cookie("refresh_token", result.refresh_token,cookie_options)
    .status(status_code.CREATED)
    .json({
      success: status.SUCCESS,
      user: result.user,
      access_token: result.access_token,
    });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  const result = await auth_services.user_login(email, password);
  res
    .cookie("refresh_token", result.refresh_token, cookie_options)
    .status(status_code.OK)
    .json({
      success: status.SUCCESS,
      user: result.user,
      access_token: result.access_token,
    });
};

const log_out = async (req, res, next) => {
  const id = req.user.id;

  await auth_services.user_log_out(id);
res.clearCookie("refresh_token", {
  httpOnly: cookie_options.httpOnly,
  secure: cookie_options.secure,
  sameSite: cookie_options.sameSite,
});
  res
    .status(status_code.OK)
    .json({ success: status.SUCCESS, message: "Logged out successfully" });
};

const refresh = async (req, res, next) => {
  const token = req.cookies.refresh_token;
  const new_token = await auth_services.new_access_token(token);
  res.status(status_code.OK).json({
    success: status.SUCCESS,
    data: { access_token: new_token.access_token },
  });
}
const change_user_password = async (req, res, next) => {
  const user_id = req.user.id;
  const {old_password,new_password} = req.body;
  const change = await auth_services.change_user_password(user_id, old_password,new_password);

  res
    .status(status_code.OK)
    .json({ success: status.SUCCESS, message: "The password has been changed successfully." });
};

const reset_user_password = async (req, res, next) => {
  const token = req.query.token;
  const { new_password, confirm_password } = req.body;
  const change = await auth_services.reset_user_password(token, new_password, confirm_password);

  res
    .status(status_code.OK)
    .json({ success: status.SUCCESS, message: "The password has been changed successfully." });
};

const reset_user_sent_mail = async (req, res, next) => {
  const { email } = req.body; 
  await auth_services.sent_reset_mail(email);
  res.status(status_code.OK).json({ success: status.SUCCESS, message: "check your email" });
}
module.exports = {
  create_user,
  login,
  refresh,
  log_out,
  change_user_password,
  reset_user_password,
  reset_user_sent_mail,
};