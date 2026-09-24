const message_controllers = require("../../controllers/message.controllers");
const message_services = require("../../services/message.services");
const { add_conversation } = require("../../services/conversation.services");
const { status_code, status } = require("../../utils/status");
const AppError = require("../../utils/apperror");

jest.mock("../../services/message.services");
jest.mock("../../services/conversation.services");

describe("Message Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {},
      params: {},
      query: {},
      body: {},
      file: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("get_conversation_messages", () => {
    it("should get messages for a conversation", async () => {
      req.user = { id: 1 };
      req.params = { conversation_id: 10 };
      req.query = { page: "1", limit: "10" };

      const mockMessages = [{ id: 1 }];
      message_services.get_conversation_messages.mockResolvedValue(mockMessages);

      await message_controllers.get_conversation_messages(req, res, next);

      expect(message_services.get_conversation_messages).toHaveBeenCalledWith(1, 10, 10, 0);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, data: mockMessages });
    });
  });

  describe("new_message", () => {
    it("should create a new message with a file", async () => {
      req.user = { id: 1 };
      req.params = { conversation_id: 10 };
      req.body = { text: "Hello with file", conversation_type: "direct", to_user_id: 2 };
      req.file = { filename: "msg-file.jpg" };

      const mockResult = { id: 100, text: "Hello with file" };
      message_services.add_new_message.mockResolvedValue(mockResult);

      await message_controllers.new_message(req, res, next);

      expect(message_services.add_new_message).toHaveBeenCalledWith(
        req.user.id,
        req.body.to_user_id,
        req.body.conversation_type,
        req.params.conversation_id,
        req.body.text,
        req.file
      );
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS });
    });

    it("should throw AppError if no file is provided", async () => {
      req.file = null;
      req.user = { id: 1 };
      req.body = { text: "Hello", conversation_type: "direct", to_user_id: 2 };
      req.params = { conversation_id: 10 };
      
      const error = new AppError("this route must be have file ", status_code.BAD_REQUEST);
      message_services.add_new_message.mockRejectedValue(error);

      await expect(message_controllers.new_message(req, res, next)).rejects.toThrow(AppError);
    });
  });

  describe("update_message", () => {
    it("should update a message", async () => {
      req.user = { id: 1 };
      req.params = { message_id: 100 };
      req.body = { text: "Updated text" };

      const mockResult = { id: 100, text: "Updated text" };
      message_services.edit_message.mockResolvedValue(mockResult);

      await message_controllers.update_message(req, res, next);

      expect(message_services.edit_message).toHaveBeenCalledWith(req.params.message_id, req.body.text, req.user.id);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, data: mockResult });
    });
  });

  describe("delete_message", () => {
    it("should delete a message", async () => {
      req.user = { id: 1 };
      req.params = { message_id: 100, conversation_id: 10 };

      message_services.remove_message.mockResolvedValue(true);

      await message_controllers.delete_message(req, res, next);

      expect(message_services.remove_message).toHaveBeenCalledWith(
        req.params.message_id,
        req.params.conversation_id,
        req.user.id
      );
      expect(res.status).toHaveBeenCalledWith(status_code.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
