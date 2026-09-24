const { async_wrapper } = require("../../utils/wrapper");

describe("async_wrapper", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  it("should call the wrapped function with req, res, next", async () => {
    const mockFn = jest.fn().mockResolvedValue("ok");
    const wrapped = async_wrapper(mockFn);

    await wrapped(req, res, next);

    expect(mockFn).toHaveBeenCalledWith(req, res, next);
  });

  it("should call next with the error if the function throws", async () => {
    const error = new Error("Async failure");
    const mockFn = jest.fn().mockRejectedValue(error);
    const wrapped = async_wrapper(mockFn);

    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("should NOT call next if the function resolves successfully", async () => {
    const mockFn = jest.fn().mockResolvedValue("success");
    const wrapped = async_wrapper(mockFn);

    await wrapped(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });

  it("should return a function", () => {
    const mockFn = jest.fn();
    const wrapped = async_wrapper(mockFn);

    expect(typeof wrapped).toBe("function");
  });
});
