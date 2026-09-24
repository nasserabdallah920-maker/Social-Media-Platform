const post_controllers = require("../../controllers/post.controllers");
const post_services = require("../../services/post.services");
const { status_code, status } = require("../../utils/status");

jest.mock("../../services/post.services");

describe("Post Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: {},
      params: {},
      query: {},
      files: [],
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("create_post", () => {
    it("should create a post successfully with images", async () => {
      req.user = { id: 1 };
      req.body = { text: "Hello World" };
      req.files = [{ filename: "image1.jpg" }, { filename: "image2.jpg" }];

      const mockPost = { id: 1, text: "Hello World", images: ["/uploads/image1.jpg", "/uploads/image2.jpg"] };
      post_services.create_post_service.mockResolvedValue(mockPost);

      await post_controllers.create_post(req, res, next);

      expect(post_services.create_post_service).toHaveBeenCalledWith(
        req.user.id,
        req.body.text,
        req.files
      );
      expect(res.status).toHaveBeenCalledWith(status_code.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockPost,
      });
    });

    it("should create a post successfully without images", async () => {
      req.user = { id: 1 };
      req.body = { text: "Hello World" };
      req.files = undefined;

      const mockPost = { id: 1, text: "Hello World", images: [] };
      post_services.create_post_service.mockResolvedValue(mockPost);

      await post_controllers.create_post(req, res, next);

      expect(post_services.create_post_service).toHaveBeenCalledWith(
        req.user.id,
        req.body.text,
        undefined
      );
      expect(res.status).toHaveBeenCalledWith(status_code.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockPost,
      });
    });
  });

  describe("get_post", () => {
    it("should get a specific post", async () => {
      req.params = { id: 10 };
      req.user = { id: 1 };

      const mockPost = { id: 10, text: "Test Post" };
      post_services.get_post_service.mockResolvedValue(mockPost);

      await post_controllers.get_post(req, res, next);

      expect(post_services.get_post_service).toHaveBeenCalledWith(req.params.id, req.user.id);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockPost,
      });
    });
  });

  describe("get_user_posts", () => {
    it("should get posts for a user with pagination", async () => {
      req.params = { user_id: 2 };
      req.user = { id: 1 };
      req.query = { page: "2", limit: "5" };

      const mockPosts = [{ id: 1 }, { id: 2 }];
      post_services.get_user_posts_service.mockResolvedValue(mockPosts);

      await post_controllers.get_user_posts(req, res, next);

      expect(post_services.get_user_posts_service).toHaveBeenCalledWith(req.params.user_id, req.user.id, 5, 5); // limit=5, offset=(2-1)*5=5
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockPosts,
      });
    });

    it("should get posts for a user with default pagination", async () => {
      req.params = { user_id: 2 };
      req.user = { id: 1 };

      const mockPosts = [{ id: 1 }];
      post_services.get_user_posts_service.mockResolvedValue(mockPosts);

      await post_controllers.get_user_posts(req, res, next);

      expect(post_services.get_user_posts_service).toHaveBeenCalledWith(req.params.user_id, req.user.id, 10, 0); // limit=10, offset=(1-1)*10=0
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockPosts,
      });
    });
  });

  describe("update_post", () => {
    it("should update a post successfully", async () => {
      req.user = { id: 1 };
      req.params = { id: 10 };
      req.body = { text: "Updated Text" };

      const mockPost = { id: 10, text: "Updated Text" };
      post_services.update_post_service.mockResolvedValue(mockPost);

      await post_controllers.update_post(req, res, next);

      expect(post_services.update_post_service).toHaveBeenCalledWith(req.user.id, req.params.id, req.body.text);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        data: mockPost,
      });
    });
  });

  describe("delete_post", () => {
    it("should delete a post successfully", async () => {
      req.user = { id: 1 };
      req.params = { id: 10 };

      post_services.delete_post_service.mockResolvedValue(true);

      await post_controllers.delete_post(req, res, next);

      expect(post_services.delete_post_service).toHaveBeenCalledWith(req.user.id, req.params.id);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        message: "Post deleted successfully",
      });
    });
  });

  describe("delete_post_file", () => {
    it("should delete a post image successfully", async () => {
      req.user = { id: 1 };
      req.params = { id: 10 };
      req.body = { file_url: "/uploads/image.jpg" };
      post_services.delete_post_file_service.mockResolvedValue(true);

      await post_controllers.delete_post_file(req, res, next);

      expect(post_services.delete_post_file_service).toHaveBeenCalledWith(req.user.id, req.params.id, req.body.file_url);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: status.SUCCESS,
        message: "Post image deleted successfully",
      });
    });
  });
});
