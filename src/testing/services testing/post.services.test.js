const postServices = require('../../services/post.services');
const post_repositories = require('../../repositories/post.repositories');
const { verify_user_blocking } = require('../../utils/checkBlock');
const { verify_user_privacy } = require('../../utils/checkPrivacy');
const fs = require('fs');
const AppError = require('../../utils/apperror');
const Redis = require('../../config/redis.config');

jest.mock('../../repositories/post.repositories');
jest.mock('../../utils/checkBlock');
jest.mock('../../utils/checkPrivacy');
jest.mock('fs');
jest.mock('../../config/redis.config');

describe('Post Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create_post_service', () => {
    it('should throw AppError if text and images are missing', async () => {
      await expect(postServices.create_post_service(1, '', [])).rejects.toThrow(AppError);
    });

    it('should create post and return it', async () => {
      post_repositories.create_post.mockResolvedValueOnce(1);
      const mockPost = { id: 1, text: 'hello' };
      post_repositories.get_post_by_id.mockResolvedValueOnce(mockPost);

      const result = await postServices.create_post_service(1, 'hello', [{ filename: 'img.png' }]);

      expect(post_repositories.create_post).toHaveBeenCalledWith(1, 'hello');
      expect(post_repositories.add_post_image).toHaveBeenCalledWith(1, '/uploads/img.png');
      expect(result).toEqual(mockPost);
    });
  });

  describe('get_post_service', () => {
    it('should throw AppError if post not found in db', async () => {
      Redis.get.mockResolvedValueOnce(null);
      post_repositories.get_post_by_id.mockResolvedValueOnce(null);
      await expect(postServices.get_post_service(1, 1)).rejects.toThrow(AppError);
    });

    it('should return post from cache if it exists', async () => {
      const mockPost = { id: 1, user_id: 2, text: 'cached' };
      Redis.get.mockResolvedValueOnce(JSON.stringify(mockPost));
      verify_user_blocking.mockResolvedValueOnce();
      verify_user_privacy.mockResolvedValueOnce();

      const result = await postServices.get_post_service(1, 1);
      
      expect(verify_user_blocking).toHaveBeenCalledWith(2, 1);
      expect(verify_user_privacy).toHaveBeenCalledWith(2, 1);
      expect(result).toEqual(mockPost);
      expect(post_repositories.get_post_by_id).not.toHaveBeenCalled();
    });

    it('should return post from db and cache it if not in cache', async () => {
      const mockPost = { id: 1, user_id: 2 };
      Redis.get.mockResolvedValueOnce(null);
      post_repositories.get_post_by_id.mockResolvedValueOnce(mockPost);
      verify_user_blocking.mockResolvedValueOnce();
      verify_user_privacy.mockResolvedValueOnce();

      const result = await postServices.get_post_service(1, 1);
      
      expect(verify_user_blocking).toHaveBeenCalledWith(2, 1);
      expect(verify_user_privacy).toHaveBeenCalledWith(2, 1);
      expect(Redis.set).toHaveBeenCalledWith('post:1', JSON.stringify(mockPost), { EX: 300 });
      expect(result).toEqual(mockPost);
    });
  });

  describe('get_user_posts_service', () => {
    it('should return user posts', async () => {
      verify_user_blocking.mockResolvedValueOnce();
      verify_user_privacy.mockResolvedValueOnce();
      const mockPosts = [{ id: 1 }];
      post_repositories.get_posts_by_user_id.mockResolvedValueOnce(mockPosts);

      const result = await postServices.get_user_posts_service(2, 1, 10, 0);
      
      expect(verify_user_blocking).toHaveBeenCalledWith(2, 1);
      expect(verify_user_privacy).toHaveBeenCalledWith(2, 1);
      expect(post_repositories.get_posts_by_user_id).toHaveBeenCalledWith(2, 10, 0);
      expect(result).toEqual(mockPosts);
    });
  });

  describe('update_post_service', () => {
    it('should update and return post and clear cache', async () => {
      post_repositories.get_post_by_id.mockResolvedValueOnce({ id: 1, user_id: 1 });
      post_repositories.update_post_by_id.mockResolvedValueOnce();
      post_repositories.get_post_by_id.mockResolvedValueOnce({ id: 1, user_id: 1, text: 'updated' });

      const result = await postServices.update_post_service(1, 1, 'updated');
      
      expect(post_repositories.update_post_by_id).toHaveBeenCalledWith(1, 'updated');
      expect(Redis.del).toHaveBeenCalledWith('post:1');
      expect(result.text).toBe('updated');
    });

    it('should throw AppError if user is unauthorized', async () => {
      post_repositories.get_post_by_id.mockResolvedValueOnce({ id: 1, user_id: 2 });
      await expect(postServices.update_post_service(1, 1, 'text')).rejects.toThrow(AppError);
    });
  });

  describe('delete_post_service', () => {
    it('should delete post and images and clear cache', async () => {
      post_repositories.get_post_by_id.mockResolvedValueOnce({ id: 1, user_id: 1, images: ['img.png'] });
      fs.existsSync.mockReturnValueOnce(true);
      fs.unlinkSync.mockReturnValueOnce();
      post_repositories.delete_post_by_id.mockResolvedValueOnce();

      await postServices.delete_post_service(1, 1);

      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(post_repositories.delete_post_by_id).toHaveBeenCalledWith(1);
      expect(Redis.del).toHaveBeenCalledWith('post:1');
    });
  });

  describe('delete_post_file_service', () => {
    it('should delete post image and clear cache', async () => {
      post_repositories.get_post_by_id.mockResolvedValueOnce({ id: 1, user_id: 1, images: ['img.png'] });
      fs.existsSync.mockReturnValueOnce(true);
      fs.unlinkSync.mockReturnValueOnce();
      post_repositories.delete_post_image.mockResolvedValueOnce();

      await postServices.delete_post_file_service(1, 1, 'img.png');

      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(post_repositories.delete_post_image).toHaveBeenCalledWith(1, 'img.png');
      expect(Redis.del).toHaveBeenCalledWith('post:1');
    });
  });
});
