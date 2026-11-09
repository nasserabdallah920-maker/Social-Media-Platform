const feed_controllers = require("../../controllers/feed.controllers");
const feed_services = require("../../services/feed.services");
const { status_code, status } = require("../../utils/status");

jest.mock("../../services/feed.services");

describe("Feed Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });


describe("feed_posts", () => {
  it("should get feed posts", async () => {
    req.user = { id: 1 };
    req.query = { page: "1", limit: "10" };

    const mockPosts = [{ id: 1 }, { id: 2 }];

    feed_services.handle_feed_posts.mockResolvedValue(mockPosts);

    await feed_controllers.feed_posts(req, res, next);

    expect(feed_services.handle_feed_posts).toHaveBeenCalledWith(
      req.user.id,
      10,
      0
    );

    expect(res.status).toHaveBeenCalledWith(status_code.OK);

    expect(res.json).toHaveBeenCalledWith({
      success: status.SUCCESS,
      posts: mockPosts,
      nextPage: null,
    });
  });

  it("should reject with error if feed_services throws", async () => {
    req.user = { id: 1 };
    req.query = { page: "1", limit: "10" };

    const error = new Error("Feed Error");

    feed_services.handle_feed_posts.mockRejectedValue(error);

    await expect(
      feed_controllers.feed_posts(req, res, next)
    ).rejects.toThrow(error);

    expect(next).not.toHaveBeenCalled();
  });
});


describe("search", () => {
  it("should perform a search", async () => {
    req.user = { id: 1 };
    req.query = { q: "test" };

    const mockResult = [{ id: 1 }];

    feed_services.search.mockResolvedValue(mockResult);

    await feed_controllers.search(req, res, next);

    expect(feed_services.search).toHaveBeenCalledWith(
      req.query.q,
      req.user.id
    );

    expect(res.status).toHaveBeenCalledWith(status_code.OK);

    expect(res.json).toHaveBeenCalledWith({
      success: status.SUCCESS,
      data: mockResult,
    });
  });

  it("should reject with error if search throws", async () => {
    req.user = { id: 1 };
    req.query = { q: "test" };

    const error = new Error("Search Error");

    feed_services.search.mockRejectedValue(error);

    await expect(
      feed_controllers.search(req, res, next)
    ).rejects.toThrow(error);

    expect(next).not.toHaveBeenCalled();
  });
});


});
