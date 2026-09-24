const notifications_controllers = require("../../controllers/notifications.controllers");
const notifications_services = require("../../services/notifications.services");

jest.mock("../../services/notifications.services");

describe("Notifications Controllers", () => {
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

  describe("get_all_notifications", () => {
    it("should get all notifications", async () => {
      req.user = { id: 1 };
      req.query = { page: "1", limit: "10" };

      const mockData = [{ id: 10 }];
      notifications_services.get_notifications.mockResolvedValue(mockData);

      await notifications_controllers.get_all_notifications(req, res, next);

      expect(notifications_services.get_notifications).toHaveBeenCalledWith(1, 1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockData });
    });
  });

  describe("read_one", () => {
    it("should mark a notification as read", async () => {
      req.user = { id: 1 };
      req.params = { id: 10 };

      notifications_services.set_read_notification.mockResolvedValue(1);

      await notifications_controllers.read_one(req, res, next);

      expect(notifications_services.set_read_notification).toHaveBeenCalledWith(10, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Notification marked as read" });
    });

    it("should reject with error if not found", async () => {
      req.user = { id: 1 };
      req.params = { id: 10 };
      const error = new Error("Notification not found");
      notifications_services.set_read_notification.mockRejectedValue(error);

      await expect(notifications_controllers.read_one(req, res, next)).rejects.toThrow(error);
    });
  });

  describe("read_all", () => {
    it("should mark all notifications as read", async () => {
      req.user = { id: 1 };

      notifications_services.set_read_all_notifications.mockResolvedValue(true);

      await notifications_controllers.read_all(req, res, next);

      expect(notifications_services.set_read_all_notifications).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "All notifications marked as read" });
    });
  });

  describe("get_unread", () => {
    it("should get unread notifications count", async () => {
      req.user = { id: 1 };

      notifications_services.get_unread_count.mockResolvedValue(5);

      await notifications_controllers.get_unread(req, res, next);

      expect(notifications_services.get_unread_count).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, unread_count: 5 });
    });
  });

  describe("delete_notification", () => {
    it("should delete a notification", async () => {
      req.user = { id: 1 };
      req.params = { id: 10 };

      notifications_services.remove_notification.mockResolvedValue(1);

      await notifications_controllers.delete_notification(req, res, next);

      expect(notifications_services.remove_notification).toHaveBeenCalledWith(10, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Notification deleted" });
    });
  });
});
