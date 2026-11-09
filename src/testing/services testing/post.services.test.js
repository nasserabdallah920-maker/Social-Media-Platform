const postServices = require('../../services/post.services');
const post_repositories = require('../../repositories/post.repositories');
const { verify_user_blocking } = require('../../utils/checkBlock');
const { verify_user_privacy } = require('../../utils/checkPrivacy');
const AppError = require('../../utils/apperror');
const Redis = require('../../config/redis.config');
const { delete_from_cloudinary } = require('../../utils/cloudinary');

jest.mock('../../repositories/post.repositories');
jest.mock('../../utils/checkBlock');
jest.mock('../../utils/checkPrivacy');
jest.mock('../../config/redis.config');
jest.mock('../../utils/cloudinary', () => ({
  upload_file_to_cloudinary: jest.fn().mockImplementation((file) => Promise.resolve({
    url: `/uploads/${file.filename || file.originalname}`,
    public_id: null,
    media_type: "image",
    format: "png",
    file_name: file.filename || file.originalname,
    file_size: 0,
  })),
  upload_multiple_to_cloudinary: jest.fn().mockImplementation((files) => Promise.resolve(
    files.map((file) => ({
      url: `/uploads/${file.filename || file.originalname}`,
      public_id: null,
      media_type: "image",
      format: "png",
      file_name: file.filename || file.originalname,
      file_size: 0,
    }))
  )),
  delete_from_cloudinary: jest.fn().mockResolvedValue(true),
}));

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
      expect(post_repositories.add_post_image).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ url: '/uploads/img.png' })
      );
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
      const mockPost = { id: 1, text: 'cached post', user_id: 1 };
      Redis.get.mockResolvedValueOnce(JSON.stringify(mockPost));

      const result = await postServices.get_post_service(1, 1);

      expect(Redis.get).toHaveBeenCalledWith('post:1');
      expect(verify_user_blocking).toHaveBeenCalledWith(1, 1);
      expect(verify_user_privacy).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(mockPost);
    });

    it('should fetch post from db and cache it if not in redis', async () => {
      const mockPost = { id: 1, text: 'db post', user_id: 1 };
      Redis.get.mockResolvedValueOnce(null);
      post_repositories.get_post_by_id.mockResolvedValueOnce(mockPost);

      const result = await postServices.get_post_service(1, 1);

      expect(post_repositories.get_post_by_id).toHaveBeenCalledWith(1, 1);
      expect(verify_user_blocking).toHaveBeenCalledWith(1, 1);
      expect(verify_user_privacy).toHaveBeenCalledWith(1, 1);
      expect(Redis.set).toHaveBeenCalledWith('post:1', JSON.stringify(mockPost), { EX: 300 });
      expect(result).toEqual(mockPost);
    });
  });

  describe('get_user_posts_service', () => {
    it('should throw AppError if limit is less than 10 or greater than 100', async () => {
      await expect(postServices.get_user_posts_service(1, 1, 5, 0)).rejects.toThrow(AppError);
      await expect(postServices.get_user_posts_service(1, 1, 105, 0)).rejects.toThrow(AppError);
    });

    it('should return user posts', async () => {
      const mockPosts = [{ id: 1, text: 'user post' }];
      post_repositories.get_posts_by_user_id.mockResolvedValueOnce(mockPosts);

      const result = await postServices.get_user_posts_service(2, 1, 10, 0);
      
      expect(verify_user_blocking).toHaveBeenCalledWith(2, 1);
      expect(verify_user_privacy).toHaveBeenCalledWith(2, 1);
      expect(post_repositories.get_posts_by_user_id).toHaveBeenCalledWith(2, 1, 10, 0);
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
      post_repositories.get_post_by_id.mockResolvedValueOnce({ id: 1, user_id: 1, images: [{ id: 1, url: 'img.png' }] });
      post_repositories.delete_post_by_id.mockResolvedValueOnce();

      await postServices.delete_post_service(1, 1);

      expect(delete_from_cloudinary).toHaveBeenCalled();
      expect(post_repositories.delete_post_by_id).toHaveBeenCalledWith(1);
      expect(Redis.del).toHaveBeenCalledWith('post:1');
    });
  });

  describe('delete_post_file_service', () => {
    it('should delete post image and clear cache', async () => {
      post_repositories.get_post_by_id.mockResolvedValueOnce({ id: 1, user_id: 1, images: [{ id: 1, url: 'img.png' }] });
      post_repositories.delete_post_image.mockResolvedValueOnce();

      await postServices.delete_post_file_service(1, 1, 'img.png');

      expect(delete_from_cloudinary).toHaveBeenCalled();
      expect(post_repositories.delete_post_image).toHaveBeenCalledWith(1, 'img.png');
      expect(Redis.del).toHaveBeenCalledWith('post:1');
    });
  });
});
