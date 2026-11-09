const {
  create_tokens,
  verify_refresh_token,
  create_reset_token,
  verify_reset_token,
} = require("../utils/jwt");
const { create_payload } = require("../utils/createPayload");
const repo = require("../repositories/user.repositories");
const password_reset_repo = require("../repositories/passwordReset.repositories");
const profile_repo = require("../repositories/profile.repositories");
const { verify_password, hash_password } = require("../utils/bcrypt");
const AppError = require("../utils/apperror");
const { status_code } = require("../utils/status");
const { get_io } = require("../socket/socketManager");
const { transpoter } = require("../emails/transpoter");
const crypto = require("crypto");
const redis = require("../config/redis.config");
const add_user = async ({
  first_name,
  last_name,
  email,
  password,
  user_name,
}) => {
  const existing_user = await repo.find_user_by_email(email);
  if (existing_user) {
    throw new AppError("Email already exists", status_code.CONFLICT);
  }
  const existing_username = await repo.find_user_by_username(user_name);
  if (existing_username) {
    throw new AppError("Username already taken", status_code.CONFLICT);
  }
  const hashed_password = await hash_password(password);
  const new_user = {
    first_name,
    last_name,
    email,
    password: hashed_password,
    user_name,
  };
  const user = await repo.save_user(new_user);
  const payload = create_payload(user);
  const tokens = create_tokens(payload);
  await repo.update_user_by_id(user.id, {
    refresh_token: tokens.refresh_token,
  });
  await profile_repo.save_profile({ user_id: user.id });
  return {
    user: { user_id: user.id, user_name: user.user_name },
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  };
};

const user_login = async (email, password) => {
  const throw_auth_error = () => {
    throw new AppError(
      "Incorrect email address or password",
      status_code.UNAUTHORIZED,
    );
  };

  const user = await repo.find_user_by_email(email);
  if (!user) throw_auth_error();

  const is_match = await verify_password(password, user.password);
  if (!is_match) throw_auth_error();

  const payload = create_payload(user);
  const tokens = await create_tokens(payload);

  await repo.update_user_by_id(user.id, {
    refresh_token: tokens.refresh_token,
  });

  return {
    user: { user_id: user.id, user_name: user.user_name },
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  };
};

const user_log_out = async (id) => {
  await repo.update_user_by_id(id, { refresh_token: null });
  return;
};

const new_access_token = async (refresh_token) => {
  const verify = await verify_refresh_token(refresh_token);
  if (!verify) {
    throw new AppError("Session expired", status_code.UNAUTHORIZED);
  }
  const user_refresh_token = await repo.find_refresh_token_by_user_id(
    verify.id,
  );

  if (!user_refresh_token || user_refresh_token !== refresh_token) {
    throw new AppError("Mismatched token", status_code.UNAUTHORIZED);
  }

  const user = await repo.find_user_by_id(verify.id);

  const payload = create_payload(user);
  const tokens = await create_tokens(payload);
  return {
    access_token: tokens.access_token,
    user: { user_id: user.id, user_name: user.user_name },
  };
};

const change_user_password = async (user_id, old_password, new_password) => {
  const user = await repo.find_user_by_id(user_id);

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
  const update = await repo.update_user_by_id(user_id, {
    password: hash_new_password,
  });
  return update;
};

const reset_user_password = async (token, new_password, confirm_password) => {
  const hash_token = crypto.createHash("sha256").update(token).digest("hex");
  const find_token = await password_reset_repo.find_reset_token(hash_token);
  if (!find_token) {
    throw new AppError(
      "The token does not match; you do not have permission.",
      status_code.UNAUTHORIZED,
    );
  }
  const verify = await verify_reset_token(token);
  if (!verify) {
    throw new AppError("The token has expired.", status_code.UNAUTHORIZED);
  }
  const user = await repo.find_user_by_id(verify.id);
  if (!user) {
    throw new AppError("This user does not exist", status_code.NOT_FOUND);
  }
  if (verify.email !== user.email) {
    throw new AppError(
      "You do not have permission to modify this password.",
      status_code.UNAUTHORIZED,
    );
  }
  if (confirm_password !== new_password) {
    throw new AppError(
      "The new password and the password confirmation do not match.",
      status_code.BAD_REQUEST,
    );
  }

  const hash_new_password = await hash_password(new_password);

  const update = await repo.update_user_by_id(verify.id, {
    password: hash_new_password,
  });
  await password_reset_repo.delete_reset_token(hash_token);
  return update;
};

const sent_reset_mail = async (email) => {
  const user = await repo.find_user_by_email(email);
  if (!user) {
    throw new AppError(
      "No user has this email address.",
      status_code.BAD_REQUEST,
    );
  }
  const key = `user:email:${email}`;

  const number_of_reset = Number(await redis.get(key)) || 0;

  if (number_of_reset >= 3) {
    throw new AppError(
      "The email has been sent three times; please try again later.",
      status_code.TOO_MANY_REQUESTS,
    );
  }

  const reset_token = await create_reset_token({
    id: user.id,
    email: user.email,
  });

  const hash_token = crypto
    .createHash("sha256")
    .update(reset_token)
    .digest("hex");

  const expires_at = new Date(Date.now() + 15 * 60 * 1000);
  if (number_of_reset && number_of_reset > 0 && number_of_reset < 3) {
    await password_reset_repo.delete_reset_token_by_user_id(user.id);
  }
  await password_reset_repo.add_reset_token(user.id, hash_token, expires_at);

  await transpoter.sendMail({
    from: "Social_media app",
    to: email,
    subject: "Reset Password",
    html: `
      <h1>Reset your password by the following link</h1>
      <a href="${process.env.FRONT_END_RESET_LINK}?token=${reset_token}">
        Click
      </a>
    `,
  });

  const new_count = await redis.incr(key);

  if (new_count === 1) {
    await redis.expire(key, 60 * 60);
  }
  return;
};

module.exports = {
  user_login,
  add_user,
  user_log_out,
  new_access_token,
  change_user_password,
  sent_reset_mail,
  reset_user_password,
};
