const AppError = require("../../utils/apperror");

describe("AppError", () => {
  it("should create an error with the correct message and status_code", () => {
    const error = new AppError("Not Found", 404);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Not Found");
    expect(error.status_code).toBe(404);
  });

  it("should set status to 'fail' for 4xx errors", () => {
    const error400 = new AppError("Bad Request", 400);
    const error401 = new AppError("Unauthorized", 401);
    const error403 = new AppError("Forbidden", 403);
    const error404 = new AppError("Not Found", 404);
    const error409 = new AppError("Conflict", 409);

    expect(error400.status).toBe("fail");
    expect(error401.status).toBe("fail");
    expect(error403.status).toBe("fail");
    expect(error404.status).toBe("fail");
    expect(error409.status).toBe("fail");
  });

  it("should set status to 'error' for 5xx errors", () => {
    const error500 = new AppError("Internal Server Error", 500);
    const error503 = new AppError("Service Unavailable", 503);

    expect(error500.status).toBe("error");
    expect(error503.status).toBe("error");
  });

  it("should have a stack trace", () => {
    const error = new AppError("Test Error", 500);

    expect(error.stack).toBeDefined();
  });
});
