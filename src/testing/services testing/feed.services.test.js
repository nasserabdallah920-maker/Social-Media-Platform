const feedServices = require('../../services/feed.services');
const feed_repositories = require('../../repositories/feed.repositories');
const post_repositories = require('../../repositories/post.repositories');
const user_repositories = require('../../repositories/user.repositories');

jest.mock('../../repositories/feed.repositories');
jest.mock('../../repositories/post.repositories');
jest.mock('../../repositories/user.repositories');

describe('Feed Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle_feed_posts', () => {
    it('should return posts from feed repository', async () => {
      const mockPosts = [{ id: 1 }, { id: 2 }];
      feed_repositories.get_posts_feed.mockResolvedValueOnce(mockPosts);

      const result = await feedServices.handle_feed_posts(1, 10, 0);
      
      expect(feed_repositories.get_posts_feed).toHaveBeenCalledWith(1, 10, 0);
      expect(result).toEqual(mockPosts);
    });
  });

  describe('search', () => {
    it('should return users and posts from search', async () => {
      const mockUsers = [{ id: 2 }];
      const mockPosts = [{ id: 3 }];
      user_repositories.search_users.mockResolvedValueOnce(mockUsers);
      post_repositories.search_posts.mockResolvedValueOnce(mockPosts);

      const result = await feedServices.search('test', 1);

      expect(user_repositories.search_users).toHaveBeenCalledWith('test', 1);
      expect(post_repositories.search_posts).toHaveBeenCalledWith('test', 1);
      expect(result).toEqual({ users: mockUsers, posts: mockPosts });
    });
  });
});
