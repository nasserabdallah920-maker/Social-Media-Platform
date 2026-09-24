const bcrypt = require("bcryptjs");

const hash_password = async (password) => {
  const salt = Number(process.env.BCRYPT_SALT_ROUNDS);
  const hashed_password = await bcrypt.hashSync(password, salt);
  return hashed_password;
};

const verify_password = async (password, hashed_password) => {
  const verify = await bcrypt.compare(password, hashed_password);
  return verify;
};

module.exports = { hash_password, verify_password };