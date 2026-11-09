const { status, status_code } = require("../utils/status");

const handle_error = (err, req, res, next) => {

  if (err.name === "ZodError") {
    return res.status(status_code.UNPROCESSABLE_ENTITY).json({
      success: status.FAIL,
      error: err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }
  switch (err.code) {
    case "ER_DUP_ENTRY":
      return res.status(status_code.CONFLICT).json({
        success: status.FAIL,
        message: "This resource already exists",
      });

    case "ER_NO_REFERENCED_ROW_2":
      return res.status(status_code.BAD_REQUEST).json({
        success: status.FAIL,
        message: "The requested resource does not exist",
      });

    case "ER_ROW_IS_REFERENCED_2":
      return res.status(status_code.CONFLICT).json({
        success: status.FAIL,
        message: "This resource cannot be deleted",
      });

    case "ER_BAD_NULL_ERROR":
      return res.status(status_code.BAD_REQUEST).json({
        success: status.FAIL,
        message: "A required field is missing",
      });

    case "ER_DATA_TOO_LONG":
      return res.status(status_code.BAD_REQUEST).json({
        success: status.FAIL,
        message: "The provided data is too long",
      });

    case "WARN_DATA_TRUNCATED":
      return res.status(status_code.BAD_REQUEST).json({
        success: status.FAIL,
        message: "Invalid value provided",
      });
  }


  const current_status_code =
    err.status_code ||
    status_code.INTERNAL_SERVER_ERROR;

  if (
    current_status_code >= 500
  ) {
    return res.status(current_status_code).json({
      success: status.FAIL,
      message: "Internal server error",
    });
  }

  return res.status(current_status_code).json({
    success: status.FAIL,
    message: err.message || "Something went wrong",
  });
};

module.exports = { handle_error };
