const conversationServices = require('../../services/conversation.services');
const conversation_repositories = require('../../repositories/conversation.repositories');

jest.mock('../../repositories/conversation.repositories');

describe('Conversation Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add_conversation', () => {
    it('should return existing conversation id if found', async () => {
      conversation_repositories.check_conversation.mockResolvedValueOnce([{ id: 10 }]);
      const result = await conversationServices.add_conversation([1, 2]);
      expect(result).toBe(10);
      expect(conversation_repositories.create_conversation).not.toHaveBeenCalled();
    });

    it('should create group conversation if type is group', async () => {
      conversation_repositories.create_conversation.mockResolvedValueOnce(20);
      const result = await conversationServices.add_conversation([1, 2, 3], 'group', { name: "Team" });
      expect(result).toBe(20);
      expect(conversation_repositories.create_conversation).toHaveBeenCalledWith('group', [1, 2, 3], { name: "Team" });
    });

    it('should create direct conversation if type is not provided and not found', async () => {
      conversation_repositories.check_conversation.mockResolvedValueOnce([]);
      conversation_repositories.create_conversation.mockResolvedValueOnce(30);
      const result = await conversationServices.add_conversation([1, 2]);
      expect(result).toBe(30);
      expect(conversation_repositories.create_conversation).toHaveBeenCalledWith('direct', [1, 2], {});
    });
  });

  describe('get_user_conversations', () => {
    it('should return user conversations', async () => {
      const mockConvos = [{ id: 1 }, { id: 2 }];
      conversation_repositories.get_user_conversations.mockResolvedValueOnce(mockConvos);
      const result = await conversationServices.get_user_conversations(1);
      expect(result).toEqual(mockConvos);
    });
  });

  describe('remove_conversation', () => {
    it('should remove conversation', async () => {
      conversation_repositories.check_conversation_member.mockResolvedValueOnce(true);
      conversation_repositories.delete_conversation_by_id.mockResolvedValueOnce();
      await conversationServices.remove_conversation(1, 1);
      expect(conversation_repositories.delete_conversation_by_id).toHaveBeenCalledWith(1);
    });
  });
});
