const relations_controllers = require("../../controllers/relations.controllers");
const relations_services = require("../../services/relations.services");
const { status_code, status } = require("../../utils/status");

jest.mock("../../services/relations.services");

describe("Relations Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("follow", () => {
    it("should follow a user", async () => {
      req.user = { id: 1 };
      req.params = { following_id: 2 };

      relations_services.follow_user.mockResolvedValue("Followed successfully");

      await relations_controllers.follow(req, res, next);

      expect(relations_services.follow_user).toHaveBeenCalledWith(1, 2);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, message: "Followed successfully" });
    });
  });

  describe("unfollow", () => {
    it("should unfollow a user", async () => {
      req.user = { id: 1 };
      req.params = { following_id: 2 };

      relations_services.unfollow_user.mockResolvedValue("Unfollowed successfully");

      await relations_controllers.unfollow(req, res, next);

      expect(relations_services.unfollow_user).toHaveBeenCalledWith(1, 2);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, message: "Unfollowed successfully" });
    });
  });

  describe("block", () => {
    it("should block a user", async () => {
      req.user = { id: 1 };
      req.params = { blocked_id: 2 };

      relations_services.block_user.mockResolvedValue(true);

      await relations_controllers.block(req, res, next);

      expect(relations_services.block_user).toHaveBeenCalledWith(1, 2);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, message: "User blocked successfully" });
    });
  });

  describe("unblock", () => {
    it("should unblock a user", async () => {
      req.user = { id: 1 };
      req.params = { blocked_id: 2 };

      relations_services.unblock_user.mockResolvedValue(true);

      await relations_controllers.unblock(req, res, next);

      expect(relations_services.unblock_user).toHaveBeenCalledWith(1, 2);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, message: "User unblocked successfully" });
    });
  });

  describe("get_followers", () => {
    it("should get followers", async () => {
      req.params = { user_id: 2 };
      req.query = { page: "1", limit: "10" };

      const mockData = [{ id: 1 }];
      relations_services.get_user_followers.mockResolvedValue(mockData);

      await relations_controllers.get_followers(req, res, next);

      expect(relations_services.get_user_followers).toHaveBeenCalledWith(2, 10, 0);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, data: mockData });
    });
  });

  describe("get_relation_status", () => {
    it("should get relation status", async () => {
      req.user = { id: 1 };
      req.params = { user_id: 2 };

      const mockStatus = { is_following: true };
      relations_services.get_relation_status.mockResolvedValue(mockStatus);

      await relations_controllers.get_relation_status(req, res, next);

      expect(relations_services.get_relation_status).toHaveBeenCalledWith(1, 2);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, data: mockStatus });
    });
  });
});
