const commentServices = require('../../services/comment.services');
const comment_repositories = require('../../repositories/comment.repositories');
const post_repositories = require('../../repositories/post.repositories');
const { verify_user_blocking } = require('../../utils/checkBlock');
const { verify_user_privacy } = require('../../utils/checkPrivacy');
const { sent_comment_notification } = require('../../services/notifications.services');
const { get_user_details_by_id } = require('../../services/user.services');
const AppError = require('../../utils/apperror');

jest.mock('../../repositories/comment.repositories');
jest.mock('../../repositories/post.repositories');
jest.mock('../../utils/checkBlock');
jest.mock('../../utils/checkPrivacy');
jest.mock('../../services/notifications.services');
jest.mock('../../services/user.services');

describe('Comment Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create_comment_service', () => {
    it('should throw AppError if text and image_url are both missing', async () => {
      await expect(commentServices.create_comment_service(1, 1, '', '')).rejects.toThrow(AppError);
    });

    it('should throw AppError if post not found', async () => {
      post_repositories.get_post_by_id.mockResolvedValueOnce(null);
      await expect(commentServices.create_comment_service(1, 1, 'text')).rejects.toThrow(AppError);
    });

    it('should create comment and send notification', async () => {
      const mockPost = { id: 1, user_id: 2 };
      post_repositories.get_post_by_id.mockResolvedValueOnce(mockPost);
      verify_user_blocking.mockResolvedValueOnce();
      verify_user_privacy.mockResolvedValueOnce();
      
      comment_repositories.create_comment.mockResolvedValueOnce(10);
      const mockComment = { id: 10, text: 'text' };
      comment_repositories.get_comment_by_id.mockResolvedValueOnce(mockComment);
      
      const mockUser = { id: 1, username: 'tester' };
      get_user_details_by_id.mockResolvedValueOnce(mockUser);
      sent_comment_notification.mockResolvedValueOnce();

      const result = await commentServices.create_comment_service(1, 1, 'text', { filename: 'img.png' });
      
      expect(comment_repositories.create_comment).toHaveBeenCalledWith(1, 1, 'text', '/uploads/img.png');
      expect(sent_comment_notification).toHaveBeenCalledWith(1, 2, 'comment', mockUser, mockPost, mockComment);
      expect(result).toEqual(mockComment);
    });
  });

  describe('get_post_comments_service', () => {
    it('should throw AppError if post not found', async () => {
      post_repositories.get_post_by_id.mockResolvedValueOnce(null);
      await expect(commentServices.get_post_comments_service(1, 1, 10, 0)).rejects.toThrow(AppError);
    });

    it('should return comments for a post', async () => {
      post_repositories.get_post_by_id.mockResolvedValueOnce({ id: 1, user_id: 2 });
      verify_user_blocking.mockResolvedValueOnce();
      verify_user_privacy.mockResolvedValueOnce();
      const mockComments = [{ id: 1 }, { id: 2 }];
      comment_repositories.get_comments_by_post_id.mockResolvedValueOnce(mockComments);

      const result = await commentServices.get_post_comments_service(1, 1, 10, 0);
      
      expect(result).toEqual(mockComments);
    });
  });

  describe('update_comment_service', () => {
    it('should throw AppError if text is missing', async () => {
      await expect(commentServices.update_comment_service(1, 1, '')).rejects.toThrow(AppError);
    });

    it('should throw AppError if comment not found', async () => {
      comment_repositories.get_comment_by_id.mockResolvedValueOnce(null);
      await expect(commentServices.update_comment_service(1, 1, 'text')).rejects.toThrow(AppError);
    });

    it('should throw AppError if user is unauthorized', async () => {
      comment_repositories.get_comment_by_id.mockResolvedValueOnce({ id: 1, user_id: 2 });
      await expect(commentServices.update_comment_service(1, 1, 'text')).rejects.toThrow(AppError);
    });

    it('should update and return the comment', async () => {
      comment_repositories.get_comment_by_id.mockResolvedValueOnce({ id: 1, user_id: 1 });
      comment_repositories.update_comment_by_id.mockResolvedValueOnce();
      comment_repositories.get_comment_by_id.mockResolvedValueOnce({ id: 1, user_id: 1, text: 'text' });

      const result = await commentServices.update_comment_service(1, 1, 'text');
      
      expect(comment_repositories.update_comment_by_id).toHaveBeenCalledWith(1, 'text');
      expect(result.text).toBe('text');
    });
  });

  describe('delete_comment_service', () => {
    it('should throw AppError if comment not found', async () => {
      comment_repositories.get_comment_by_id.mockResolvedValueOnce(null);
      await expect(commentServices.delete_comment_service(1, 1)).rejects.toThrow(AppError);
    });

    it('should throw AppError if user is unauthorized', async () => {
      comment_repositories.get_comment_by_id.mockResolvedValueOnce({ id: 1, user_id: 2 });
      await expect(commentServices.delete_comment_service(1, 1)).rejects.toThrow(AppError);
    });

    it('should delete the comment', async () => {
      comment_repositories.get_comment_by_id.mockResolvedValueOnce({ id: 1, user_id: 1 });
      comment_repositories.delete_comment_by_id.mockResolvedValueOnce();

      await commentServices.delete_comment_service(1, 1);
      
      expect(comment_repositories.delete_comment_by_id).toHaveBeenCalledWith(1);
    });
  });
});
