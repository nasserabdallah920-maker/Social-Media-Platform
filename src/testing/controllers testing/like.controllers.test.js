const like_controllers = require("../../controllers/like.controllers");
const like_services = require("../../services/like.services");
const { status_code, status } = require("../../utils/status");

jest.mock("../../services/like.services");

describe("Like Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("toggle_like", () => {
    it("should toggle a like", async () => {
      req.user = { id: 1 };
      req.params = { post_id: 10 };

      const mockResult = { liked: true };
      like_services.toggle_like_service.mockResolvedValue(mockResult);

      await like_controllers.toggle_like(req, res, next);

      expect(like_services.toggle_like_service).toHaveBeenCalledWith(req.user.id, req.params.post_id);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockResult,
      });
    });
  });

  describe("get_post_likes", () => {
    it("should get post likes", async () => {
      req.user = { id: 1 };
      req.params = { post_id: 10 };

      const mockLikes = [{ id: 1, name: "User" }];
      like_services.get_post_likes_service.mockResolvedValue(mockLikes);

      await like_controllers.get_post_likes(req, res, next);

      expect(like_services.get_post_likes_service).toHaveBeenCalledWith(req.params.post_id, req.user.id);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockLikes,
      });
    });
  });
});
