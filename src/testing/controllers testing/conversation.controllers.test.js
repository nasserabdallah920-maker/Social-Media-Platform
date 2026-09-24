const conversation_controllers = require("../../controllers/conversation.controllers");
const conversation_services = require("../../services/conversation.services");
const { status_code, status } = require("../../utils/status");

jest.mock("../../services/conversation.services");

describe("Conversation Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("get_user_conversations", () => {
    it("should get user conversations", async () => {
      req.user = { id: 1 };
      const mockResult = [{ id: 10, name: "Chat 1" }];
      conversation_services.get_user_conversations.mockResolvedValue(mockResult);

      await conversation_controllers.get_user_conversations(req, res, next);

      expect(conversation_services.get_user_conversations).toHaveBeenCalledWith(req.user.id);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, data: mockResult });
    });
  });

  describe("delete_conversation", () => {
    it("should delete a conversation", async () => {
      req.params = { conversation_id: 10 };
      conversation_services.remove_conversation.mockResolvedValue(true);

      await conversation_controllers.delete_conversation(req, res, next);

      expect(conversation_services.remove_conversation).toHaveBeenCalledWith(req.params.conversation_id);
      expect(res.status).toHaveBeenCalledWith(status_code.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe("create_direct_conversation", () => {
    it("should create a direct conversation", async () => {
      req.user = { id: 1 };
      req.params = { user_id: 2 };
      conversation_services.add_conversation.mockResolvedValue(10);

      await conversation_controllers.create_direct_conversation(req, res, next);

      expect(conversation_services.add_conversation).toHaveBeenCalledWith([req.user.id, req.params.user_id]);
      expect(res.status).toHaveBeenCalledWith(status_code.OK);
      expect(res.json).toHaveBeenCalledWith({ success: status.SUCCESS, data: { conversation_id: 10 } });
    });
  });
});
