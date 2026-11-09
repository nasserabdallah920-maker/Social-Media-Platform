const AppError = require("../utils/apperror"); 
const { verify_access_token } = require("../utils/jwt");
const { status_code } = require("../utils/status");
const user_repositories = require("../repositories/user.repositories");
const { async_wrapper } = require("../utils/wrapper");

const protect = async_wrapper(async (req, res, next) => {

  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return next(
      new AppError("The token was not found", status_code.UNAUTHORIZED),
    );
  }
  const payload = await verify_access_token(token);
  
  
  const user = await user_repositories.find_user_by_id(payload.id);
  if (!user) {
    return next(new AppError("User not found", status_code.UNAUTHORIZED));
  }
  req.user = payload;
  

  next();
});

module.exports = { protect };