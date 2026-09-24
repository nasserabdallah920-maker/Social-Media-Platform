const profile_controllers = require("../../controllers/profile.controllers");
const profile_services = require("../../services/profile.services");
const { status_code, status } = require("../../utils/status");

jest.mock("../../services/profile.services");

describe("Profile Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {},
      params: {},
      body: {},
      file: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });
  describe("update_profile", () => {
    it("should update profile", async () => {
      req.user = { id: 1 };
      req.body = { bio: "New bio" };

      profile_services.update_profile.mockResolvedValue(true);

      await profile_controllers.update_profile(req, res, next);

      expect(profile_services.update_profile).toHaveBeenCalledWith(1, { bio: "New bio" });
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, message: "Profile updated successfully" });
    });
  });

  describe("update_avatar", () => {
    it("should update avatar", async () => {
      req.user = { id: 1 };
      req.file = { filename: "avatar.jpg" };

      profile_services.update_avatar.mockResolvedValue(true);

      await profile_controllers.update_avatar(req, res, next);

      expect(profile_services.update_avatar).toHaveBeenCalledWith(1, { filename: "avatar.jpg" });
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, message: "Profile updated successfully" });
    });
  });



  describe("toggle_privacy", () => {
    it("should toggle privacy", async () => {
      req.user = { id: 1 };

      profile_services.toggle_privacy_status.mockResolvedValue(true);

      await profile_controllers.toggle_privacy(req, res, next);

      expect(profile_services.toggle_privacy_status).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, message: "Privacy status updated successfully", data: { is_private: true } });
    });
  });
});
