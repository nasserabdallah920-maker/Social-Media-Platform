const comment_controllers = require("../../controllers/comment.controllers");
const comment_services = require("../../services/comment.services");
const { status_code, status } = require("../../utils/status");

jest.mock("../../services/comment.services");

describe("Comment Controllers", () => {
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

  describe("create_comment", () => {
    it("should create a comment successfully", async () => {
      req.user = { id: 1 };
      req.params = { post_id: 10 };
      req.body = { text: "Nice post!" };
      req.file = { filename: "image.jpg" };

      const mockComment = {
        id: 100,
        text: "Nice post!",
        image_url: "/uploads/image.jpg",
      };

      comment_services.create_comment_service.mockResolvedValue(mockComment);

      await comment_controllers.create_comment(req, res, next);

      expect(comment_services.create_comment_service).toHaveBeenCalledWith(
        req.user.id,
        req.params.post_id,
        req.body.text,
        req.file,
      );

      expect(res.status).toHaveBeenCalledWith(status_code.CREATED);

      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockComment,
      });
    });

    it("should create a comment successfully without image", async () => {
      req.user = { id: 1 };
      req.params = { post_id: 10 };
      req.body = { text: "Nice post!" };
      req.file = null;

      const mockComment = { id: 100, text: "Nice post!", image_url: null };
      comment_services.create_comment_service.mockResolvedValue(mockComment);

      await comment_controllers.create_comment(req, res, next);

      expect(comment_services.create_comment_service).toHaveBeenCalledWith(
        req.user.id,
        req.params.post_id,
        req.body.text,
        null,
      );
      expect(res.status).toHaveBeenCalledWith(status_code.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockComment,
      });
    });
  });

  describe("get_post_comments", () => {
    it("should get comments for a post", async () => {
      req.params = { post_id: 10 };
      req.user = { id: 1 };
      req.query = { page: "1", limit: "10" };

      const mockComments = [{ id: 100 }, { id: 101 }];
      comment_services.get_post_comments_service.mockResolvedValue(
        mockComments,
      );

      await comment_controllers.get_post_comments(req, res, next);

      expect(comment_services.get_post_comments_service).toHaveBeenCalledWith(
        req.params.post_id,
        req.user.id,
        10,
        0,
        3,
        1,
      );
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockComments,
        nextPage: null,
      });
    });
  });

  describe("update_comment", () => {
    it("should update a comment successfully", async () => {
      req.user = { id: 1 };
      req.params = { id: 100 };
      req.body = { text: "Updated comment" };

      const mockComment = { id: 100, text: "Updated comment" };
      comment_services.update_comment_service.mockResolvedValue(mockComment);

      await comment_controllers.update_comment(req, res, next);

      expect(comment_services.update_comment_service).toHaveBeenCalledWith(
        req.user.id,
        req.params.id,
        req.body.text,
      );
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockComment,
      });
    });
  });

  describe("delete_comment", () => {
    it("should delete a comment successfully", async () => {
      req.user = { id: 1 };
      req.params = { id: 100 };

      comment_services.delete_comment_service.mockResolvedValue(true);

      await comment_controllers.delete_comment(req, res, next);

      expect(comment_services.delete_comment_service).toHaveBeenCalledWith(
        req.user.id,
        req.params.id,
      );
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        message: "Comment deleted successfully",
      });
    });
  });
});
