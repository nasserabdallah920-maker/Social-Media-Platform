const commentReplyServices = require('../../services/commentReply.services');
const comment_reply_repositories = require('../../repositories/commentReply.repositories');
const comment_repositories = require('../../repositories/comment.repositories');
const AppError = require('../../utils/apperror');

jest.mock('../../repositories/commentReply.repositories');
jest.mock('../../repositories/comment.repositories');
jest.mock('../../services/user.services');
jest.mock('../../services/notifications.services');

describe('Comment Reply Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create_reply_service', () => {
    it('should throw AppError if text is missing', async () => {
      await expect(commentReplyServices.create_reply_service(1, 1, 2, '')).rejects.toThrow(AppError);
    });

    it('should throw AppError if comment not found', async () => {
      comment_repositories.get_comment_by_id.mockResolvedValueOnce(null);
      await expect(commentReplyServices.create_reply_service(1, 1, 2, 'text')).rejects.toThrow(AppError);
    });

    it('should create and return the reply', async () => {
      comment_repositories.get_comment_by_id.mockResolvedValueOnce({ id: 1 });
      comment_reply_repositories.create_reply.mockResolvedValueOnce(10);
      const mockReply = { id: 10, text: 'text' };
      comment_reply_repositories.get_reply_by_id.mockResolvedValueOnce(mockReply);

      const result = await commentReplyServices.create_reply_service(1, 1, 2, 'text', { filename: 'img.png' });
      
      expect(comment_reply_repositories.create_reply).toHaveBeenCalledWith(1, 1, 2, 'text', '/uploads/img.png');
      expect(result).toEqual(mockReply);
    });
  });

  describe('get_comment_replies_service', () => {
    it('should throw AppError if comment not found', async () => {
      comment_repositories.get_comment_by_id.mockResolvedValueOnce(null);
      await expect(commentReplyServices.get_comment_replies_service(1, 10, 0)).rejects.toThrow(AppError);
    });

    it('should return replies for a comment', async () => {
      comment_repositories.get_comment_by_id.mockResolvedValueOnce({ id: 1 });
      const mockReplies = [{ id: 1 }, { id: 2 }];
      comment_reply_repositories.get_replies_by_comment_id.mockResolvedValueOnce(mockReplies);

      const result = await commentReplyServices.get_comment_replies_service(1, 10, 0);
      
      expect(result).toEqual(mockReplies);
    });
  });

  describe('update_reply_service', () => {
    it('should throw AppError if text is missing', async () => {
      await expect(commentReplyServices.update_reply_service(1, 1, '')).rejects.toThrow(AppError);
    });

    it('should throw AppError if reply not found', async () => {
      comment_reply_repositories.get_reply_by_id.mockResolvedValueOnce(null);
      await expect(commentReplyServices.update_reply_service(1, 1, 'text')).rejects.toThrow(AppError);
    });

    it('should throw AppError if user is unauthorized', async () => {
      comment_reply_repositories.get_reply_by_id.mockResolvedValueOnce({ id: 1, from_user_id: 2 });
      await expect(commentReplyServices.update_reply_service(1, 1, 'text')).rejects.toThrow(AppError);
    });

    it('should update and return the reply', async () => {
      comment_reply_repositories.get_reply_by_id.mockResolvedValueOnce({ id: 1, from_user_id: 1 });
      comment_reply_repositories.update_reply_by_id.mockResolvedValueOnce();
      comment_reply_repositories.get_reply_by_id.mockResolvedValueOnce({ id: 1, from_user_id: 1, text: 'text' });

      const result = await commentReplyServices.update_reply_service(1, 1, 'text');
      
      expect(comment_reply_repositories.update_reply_by_id).toHaveBeenCalledWith(1, 'text');
      expect(result.text).toBe('text');
    });
  });

  describe('delete_reply_service', () => {
    it('should throw AppError if reply not found', async () => {
      comment_reply_repositories.get_reply_by_id.mockResolvedValueOnce(null);
      await expect(commentReplyServices.delete_reply_service(1, 1)).rejects.toThrow(AppError);
    });

    it('should throw AppError if user is unauthorized', async () => {
      comment_reply_repositories.get_reply_by_id.mockResolvedValueOnce({ id: 1, from_user_id: 2 });
      await expect(commentReplyServices.delete_reply_service(1, 1)).rejects.toThrow(AppError);
    });

    it('should delete the reply', async () => {
      comment_reply_repositories.get_reply_by_id.mockResolvedValueOnce({ id: 1, from_user_id: 1 });
      comment_reply_repositories.delete_reply_by_id.mockResolvedValueOnce();

      await commentReplyServices.delete_reply_service(1, 1);
      
      expect(comment_reply_repositories.delete_reply_by_id).toHaveBeenCalledWith(1);
    });
  });
});
