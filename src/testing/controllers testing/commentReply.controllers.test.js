const commentReply_controllers = require("../../controllers/commentReply.controllers");
const commentReply_services = require("../../services/commentReply.services");
const { status_code, status } = require("../../utils/status");

jest.mock("../../services/commentReply.services");

describe("Comment Reply Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: {},
      params: {},
      query: {},
      file: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("create_reply", () => {
    it("should create a reply successfully with image", async () => {
      req.user = { id: 1 };
      req.params = { comment_id: 10 };
      req.body = { text: "Reply text", to_user_id: 2 };
      req.file = { filename: "reply-image.jpg" };

      const mockReply = {
        id: 100,
        text: "Reply text",
        image_url: "/uploads/reply-image.jpg",
      };

      commentReply_services.create_reply_service.mockResolvedValue(mockReply);

      await commentReply_controllers.create_reply(req, res, next);

      expect(commentReply_services.create_reply_service).toHaveBeenCalledWith(
        req.user.id,
        req.params.comment_id,
        req.body.to_user_id,
        req.body.text,
        req.file,
      );

      expect(res.status).toHaveBeenCalledWith(status_code.CREATED);

      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockReply,
      });
    });

    it("should create a reply successfully without image", async () => {
      req.user = { id: 1 };
      req.params = { comment_id: 10 };
      req.body = { text: "Reply text", to_user_id: 2 };
      req.file = undefined;

      const mockReply = {
        id: 100,
        text: "Reply text",
        image_url: null,
      };

      commentReply_services.create_reply_service.mockResolvedValue(mockReply);

      await commentReply_controllers.create_reply(req, res, next);

      expect(commentReply_services.create_reply_service).toHaveBeenCalledWith(
        req.user.id,
        req.params.comment_id,
        req.body.to_user_id,
        req.body.text,
        req.file,
      );

      expect(res.status).toHaveBeenCalledWith(status_code.CREATED);

      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockReply,
      });
    });
  });

  describe("get_comment_replies", () => {
    it("should get replies for a comment with pagination", async () => {
      req.user = { id: 1 };
      req.params = { comment_id: 10 };
      req.query = { page: "2", limit: "5" };

      const mockReplies = [{ id: 100 }];
      commentReply_services.get_comment_replies_service.mockResolvedValue(
        mockReplies,
      );

      await commentReply_controllers.get_comment_replies(req, res, next);

      expect(
        commentReply_services.get_comment_replies_service,
      ).toHaveBeenCalledWith(req.params.comment_id, 5, 5, 1);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockReplies,
        nextPage: null,
      });
    });
  });

  describe("update_reply", () => {
    it("should update a reply", async () => {
      req.user = { id: 1 };
      req.params = { id: 100 };
      req.body = { text: "Updated reply" };

      const mockReply = { id: 100, text: "Updated reply" };
      commentReply_services.update_reply_service.mockResolvedValue(mockReply);

      await commentReply_controllers.update_reply(req, res, next);

      expect(commentReply_services.update_reply_service).toHaveBeenCalledWith(
        req.user.id,
        req.params.id,
        req.body.text,
      );
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockReply,
      });
    });
  });

  describe("delete_reply", () => {
    it("should delete a reply", async () => {
      req.user = { id: 1 };
      req.params = { id: 100 };

      commentReply_services.delete_reply_service.mockResolvedValue(true);

      await commentReply_controllers.delete_reply(req, res, next);

      expect(commentReply_services.delete_reply_service).toHaveBeenCalledWith(
        req.user.id,
        req.params.id,
      );
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        message: "Reply deleted successfully",
      });
    });
  });
});
