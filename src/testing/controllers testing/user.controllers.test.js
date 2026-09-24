const user_controllers = require("../../controllers/user.controllers");
const user_services = require("../../services/user.services");
const { status_code, status } = require("../../utils/status");

jest.mock("../../services/user.services");

describe("User Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("get_user", () => {
    it("should get user by id", async () => {
      req.params = { id: 1 };
      const mockUser = { id: 1, name: "Test User" };
      user_services.get_user_by_id.mockResolvedValue(mockUser);

      await user_controllers.get_user(req, res, next);

      expect(user_services.get_user_by_id).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, data: mockUser });
    });
  });

  describe("delete_user", () => {
    it("should delete the logged in user", async () => {
      req.user = { id: 1 };
      user_services.remove_user_by_id.mockResolvedValue(true);

      await user_controllers.delete_user(req, res, next);

      expect(user_services.remove_user_by_id).toHaveBeenCalledWith(req.user.id);
      expect(res.status).toHaveBeenCalledWith(status_code.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe("change_user_information", () => {
    it("should change user information", async () => {
      req.user = { id: 1 };
      req.body = { name: "New Name" };
      const mockUpdatedUser = { id: 1, name: "New Name" };
      user_services.change_user_information.mockResolvedValue(mockUpdatedUser);

      await user_controllers.change_user_information(req, res, next);

      expect(user_services.change_user_information).toHaveBeenCalledWith(req.user.id, req.body);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, data: { user: mockUpdatedUser } });
    });
  });

  describe("change_user_password", () => {
    it("should change user password", async () => {
      req.user = { id: 1 };
      req.body = { old_password: "old", new_password: "new" };
      const mockUpdatedUser = { id: 1 };
      user_services.change_user_password.mockResolvedValue(mockUpdatedUser);

      await user_controllers.change_user_password(req, res, next);

      expect(user_services.change_user_password).toHaveBeenCalledWith(req.user.id, req.body);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, data: { user: mockUpdatedUser } });
    });
  });

  describe("get_user_details", () => {
    it("should get user details including relation status", async () => {
      req.params = { id: 2 };
      req.user = { id: 1 };
      const mockDetails = { id: 2, name: "User 2", is_friend: true };
      user_services.get_user_details_by_id.mockResolvedValue(mockDetails);

      await user_controllers.get_user_details(req, res, next);

      expect(user_services.get_user_details_by_id).toHaveBeenCalledWith(req.params.id, req.user.id);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, data: mockDetails });
    });
  });

  describe("search_users", () => {
    it("should search users with a query string", async () => {
      req.query = { q: "test" };
      req.user = { id: 1 };
      const mockUsers = [{ id: 2, name: "test user" }];
      user_services.search_users.mockResolvedValue(mockUsers);

      await user_controllers.search_users(req, res, next);

      expect(user_services.search_users).toHaveBeenCalledWith("test", req.user.id);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, data: mockUsers });
    });

    it("should search users with an empty query string if not provided", async () => {
      req.query = {};
      req.user = { id: 1 };
      const mockUsers = [{ id: 2, name: "another user" }];
      user_services.search_users.mockResolvedValue(mockUsers);

      await user_controllers.search_users(req, res, next);

      expect(user_services.search_users).toHaveBeenCalledWith("", req.user.id);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, data: mockUsers });
    });
  });
});
