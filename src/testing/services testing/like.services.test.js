const likeServices = require('../../services/like.services');
const like_repositories = require('../../repositories/like.repositories');
const post_repositories = require('../../repositories/post.repositories');
const { sent_like_notification } = require('../../services/notifications.services');
const { get_user_details_by_id } = require('../../services/user.services');
const { verify_user_blocking } = require('../../utils/checkBlock');
const { verify_user_privacy } = require('../../utils/checkPrivacy');
const AppError = require('../../utils/apperror');

jest.mock('../../repositories/like.repositories');
jest.mock('../../repositories/post.repositories');
jest.mock('../../services/notifications.services');
jest.mock('../../services/user.services');
jest.mock('../../utils/checkBlock');
jest.mock('../../utils/checkPrivacy');

describe('Like Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toggle_like_service', () => {
    it('should throw AppError if post not found', async () => {
      post_repositories.get_post_by_id.mockResolvedValueOnce(null);
      await expect(likeServices.toggle_like_service(1, 1)).rejects.toThrow(AppError);
    });

    it('should remove like if already liked', async () => {
      post_repositories.get_post_by_id.mockResolvedValueOnce({ id: 1, user_id: 2 });
      verify_user_blocking.mockResolvedValueOnce();
      verify_user_privacy.mockResolvedValueOnce();
      like_repositories.get_like_by_user_and_post.mockResolvedValueOnce({ id: 10 });
      get_user_details_by_id.mockResolvedValueOnce({ id: 1 });
      like_repositories.remove_like.mockResolvedValueOnce();

      const result = await likeServices.toggle_like_service(1, 1);
      
      expect(like_repositories.remove_like).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual({ liked: false });
    });

    it('should add like and send notification if not liked', async () => {
      const mockPost = { id: 1, user_id: 2 };
      const mockUser = { id: 1, username: 'tester' };

      post_repositories.get_post_by_id.mockResolvedValueOnce(mockPost);
      verify_user_blocking.mockResolvedValueOnce();
      verify_user_privacy.mockResolvedValueOnce();
      like_repositories.get_like_by_user_and_post.mockResolvedValueOnce(null);
      get_user_details_by_id.mockResolvedValueOnce(mockUser);
      like_repositories.add_like.mockResolvedValueOnce();
      sent_like_notification.mockResolvedValueOnce();

      const result = await likeServices.toggle_like_service(1, 1);
      
      expect(like_repositories.add_like).toHaveBeenCalledWith(1, 1);
      expect(sent_like_notification).toHaveBeenCalledWith(1, 2, 'like', mockUser, mockPost);
      expect(result).toEqual({ liked: true });
    });
  });

  describe('get_post_likes_service', () => {
    it('should throw AppError if post not found', async () => {
      post_repositories.get_post_by_id.mockResolvedValueOnce(null);
      await expect(likeServices.get_post_likes_service(1, 1)).rejects.toThrow(AppError);
    });

    it('should return likes for a post', async () => {
      post_repositories.get_post_by_id.mockResolvedValueOnce({ id: 1, user_id: 2 });
      verify_user_blocking.mockResolvedValueOnce();
      verify_user_privacy.mockResolvedValueOnce();
      const mockLikes = [{ user_id: 1 }];
      like_repositories.get_likes_by_post_id.mockResolvedValueOnce(mockLikes);

      const result = await likeServices.get_post_likes_service(1, 1);
      
      expect(result).toEqual(mockLikes);
    });
  });
});
