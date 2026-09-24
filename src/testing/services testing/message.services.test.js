const messageServices = require('../../services/message.services');
const conversation_repositories = require('../../repositories/conversation.repositories');
const message_repositories = require('../../repositories/message.repositories');
const { get_io } = require('../../socket/socketManager');

jest.mock('../../repositories/conversation.repositories');
jest.mock('../../repositories/message.repositories');
jest.mock('../../socket/socketManager');

describe('Message Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add_new_message', () => {
    it('should save and return new message', async () => {
      const mockMessageId = 1;
      message_repositories.save_message.mockResolvedValueOnce(mockMessageId);
      conversation_repositories.get_conversation_by_id.mockResolvedValueOnce([{ id: 10 }]);
      conversation_repositories.get_other_users_id.mockResolvedValueOnce([{ user_id: 2 }]);
      const mockEmit = jest.fn();
      const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
      get_io.mockReturnValue({ to: mockTo });
      conversation_repositories.check_conversation_member.mockResolvedValueOnce(true);

      const result = await messageServices.add_new_message(1, 2, 'direct', 10, 'hello', { filename: 'file.url' });
      
      expect(message_repositories.save_message).toHaveBeenCalledWith(1, 'hello', 10, '/uploads/file.url');
      expect(result).toEqual({
        message_id: mockMessageId,
        sender_id: 1,
        file_url: '/uploads/file.url',
        text: 'hello',
        conversation_id: 10
      });
    });
  });

  describe('set_message_seen', () => {
    it('should update seen message', async () => {
      message_repositories.update_seen_message.mockResolvedValueOnce();
      await messageServices.set_message_seen(10, 1);
      expect(message_repositories.update_seen_message).toHaveBeenCalledWith(10, 1);
    });
  });

  describe('get_conversation_messages', () => {
    it('should return messages', async () => {
      const mockMessages = [{ id: 1 }];
      conversation_repositories.check_conversation_member.mockResolvedValueOnce(true);
      message_repositories.get_messages_by_conversation_id.mockResolvedValueOnce(mockMessages);
      const result = await messageServices.get_conversation_messages(10, 20, 10, 0);
      expect(result).toEqual(mockMessages);
    });
  });

  describe('edit_message', () => {
    it('should edit message and emit event to other user', async () => {
      const mockMessage = { id: 1, text: 'updated', conversation_id: 10 };
      message_repositories.update_message_details.mockResolvedValueOnce();
      message_repositories.get_message_by_id.mockResolvedValueOnce(mockMessage);
      conversation_repositories.get_other_users_id.mockResolvedValueOnce([{ user_id: 2 }]);
      
      const mockEmit = jest.fn();
      const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
      get_io.mockReturnValue({ to: mockTo });

      const result = await messageServices.edit_message(1, 'updated', 1);

      expect(message_repositories.update_message_details).toHaveBeenCalledWith(1, 'updated', 1);
      expect(mockTo).toHaveBeenCalledWith('user-2');
      expect(mockEmit).toHaveBeenCalledWith('message-edit', {
        conversation_id: 10,
        user_id: 1,
        message: mockMessage
      });
      expect(result).toEqual(mockMessage);
    });
  });

  describe('remove_message', () => {
    it('should delete message and emit event to other user', async () => {
      message_repositories.delete_message_by_id.mockResolvedValueOnce();
      conversation_repositories.get_other_users_id.mockResolvedValueOnce([{ user_id: 2 }]);
      
      const mockEmit = jest.fn();
      const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
      get_io.mockReturnValue({ to: mockTo });

      await messageServices.remove_message(1, 10, 1);

      expect(message_repositories.delete_message_by_id).toHaveBeenCalledWith(1, 1);
      expect(mockTo).toHaveBeenCalledWith('user-2');
      expect(mockEmit).toHaveBeenCalledWith('message-delete', {
        conversation_id: 10,
        user_id: 1,
        message_id: 1
      });
    });
  });
});
