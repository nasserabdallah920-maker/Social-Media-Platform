const auth_controllers = require("../../controllers/auth.controllers");
const auth_services = require("../../services/auth.services");
const { status_code, status } = require("../../utils/status");

jest.mock("../../services/auth.services");

describe("Auth Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: {},
      cookies: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("create_user", () => {
    it("should create a user, set refresh token cookie, and return access token", async () => {
      const mockUser = { id: 1, email: "test@test.com" };
      const mockResult = {
        refresh_token: "mock-refresh-token",
        user: mockUser,
        access_token: "mock-access-token",
      };

      req.body = { email: "test@test.com", password: "password123" };
      auth_services.add_user.mockResolvedValue(mockResult);

      await auth_controllers.create_user(req, res, next);

      expect(auth_services.add_user).toHaveBeenCalledWith(req.body);
      expect(res.cookie).toHaveBeenCalledWith(
        "refresh_token",
        mockResult.refresh_token,
        expect.objectContaining({ httpOnly: true, secure: false }),
      );
      expect(res.status).toHaveBeenCalledWith(status_code.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        success: status.SUCCESS,
        user: mockResult.user,
        access_token: mockResult.access_token,
      });
    });
  });

  describe("login", () => {
    it("should login a user, set refresh token cookie, and return access token", async () => {
      const mockUser = { id: 1, email: "test@test.com" };
      const mockResult = {
        refresh_token: "mock-refresh-token",
        user: mockUser,
        access_token: "mock-access-token",
      };

      req.body = { email: "test@test.com", password: "password123" };
      auth_services.user_login.mockResolvedValue(mockResult);

      await auth_controllers.login(req, res, next);

      expect(auth_services.user_login).toHaveBeenCalledWith(
        req.body.email,
        req.body.password,
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refresh_token",
        mockResult.refresh_token,
        expect.objectContaining({ httpOnly: true, secure: false }),
      );
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: status.SUCCESS,
        user: mockResult.user,
        access_token: mockResult.access_token,
      });
    });
  });

  describe("log_out", () => {
    it("should log out a user and clear refresh token cookie", async () => {
      req.user = { id: 1 };
      auth_services.user_log_out.mockResolvedValue(true);

      await auth_controllers.log_out(req, res, next);

      expect(auth_services.user_log_out).toHaveBeenCalledWith(req.user.id);
      expect(res.clearCookie).toHaveBeenCalledWith("refresh_token", expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: status.SUCCESS,
        message: "Logged out successfully",
      });
    });
  });

  describe("refresh", () => {
    it("should generate a new access token using refresh token", async () => {
      req.cookies = { refresh_token: "mock-refresh-token" };
      const mockNewToken = { access_token: "new-access-token", user: { user_id: 1, user_name: "johndoe" } };
      auth_services.new_access_token.mockResolvedValue(mockNewToken);

      await auth_controllers.refresh(req, res, next);

      expect(auth_services.new_access_token).toHaveBeenCalledWith(
        req.cookies.refresh_token,
      );
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: status.SUCCESS,
        user: mockNewToken.user,
        access_token: mockNewToken.access_token,
      });
    });
  });

  describe("change_user_password", () => {
    it("should change user password successfully", async () => {
      req.user = { id: 1 };

      const old_password = "old";
      const new_password = "new";
      req.body = { old_password, new_password };
      auth_services.change_user_password.mockResolvedValue(true);

      await auth_controllers.change_user_password(req, res, next);

      expect(auth_services.change_user_password).toHaveBeenCalledWith(
        req.user.id,
        old_password,
        new_password,
      );
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: status.SUCCESS,
        message: "The password has been changed successfully.",
      });
    });
  });

  describe("reset_user_password", () => {
    it("should reset user password successfully", async () => {
      req.query = { token: "token" };
      req.body = { new_password: "new", confirm_password: "new" };
      auth_services.reset_user_password.mockResolvedValue(true);

      await auth_controllers.reset_user_password(req, res, next);

      expect(auth_services.reset_user_password).toHaveBeenCalledWith(
        req.query.token,
        req.body.new_password,
        req.body.confirm_password,
      );
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: status.SUCCESS,
        message: "The password has been changed successfully.",
      });
    });
  });

  describe("reset_user_sent_mail", () => {
    it("should send reset password email", async () => {
      req.body = { email: "test@test.com" };
      auth_services.sent_reset_mail.mockResolvedValue(true);

      await auth_controllers.reset_user_sent_mail(req, res, next);

      expect(auth_services.sent_reset_mail).toHaveBeenCalledWith(
        req.body.email,
      );
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: status.SUCCESS,
        message: "check your email",
      });
    });
  });
});
