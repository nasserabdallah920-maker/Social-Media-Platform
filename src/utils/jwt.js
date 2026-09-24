const jwt = require("jsonwebtoken");
const AppError = require("./apperror");
const { status_code } = require("./status");

const create_tokens = (payload) => {
  const access_token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
  const refresh_token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { access_token, refresh_token };
};
const create_reset_token = (payload) => {
  const reset_access_token = jwt.sign(payload, process.env.JWT_RESET_SECRET, {
    expiresIn: "30m",
  });
  return reset_access_token;
};

const verify_access_token = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    return decoded;
  } catch (err) {
    throw new AppError("Invalid token", status_code.UNAUTHORIZED);
  }
};

const verify_refresh_token = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    return decoded;
  } catch (err) {
    throw new AppError("Invalid token", status_code.UNAUTHORIZED);
  }
};
const verify_reset_token = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);

    return decoded;
  } catch (err) {
    throw new AppError("Invalid token", status_code.UNAUTHORIZED);
  }
};

module.exports = {
  create_tokens,
  verify_access_token,
  verify_refresh_token,
  create_reset_token,
  verify_reset_token
};
