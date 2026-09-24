const userServices = require('../../services/user.services');
const user_repository = require('../../repositories/user.repositories');
const { check_follow } = require('../../repositories/relations.repositories');
const { verify_password, hash_password } = require('../../utils/bcrypt');
const AppError = require('../../utils/apperror');
const Redis = require('../../config/redis.config');
const { verify_user_privacy } = require('../../utils/checkPrivacy');

jest.mock('../../repositories/user.repositories');
jest.mock('../../repositories/relations.repositories');
jest.mock('../../utils/bcrypt');
jest.mock('../../config/redis.config');
jest.mock('../../utils/checkPrivacy');
jest.mock('../../utils/checkBlock');

describe('User Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get_user_by_id', () => {
    it('should throw AppError if user not found', async () => {
      Redis.get.mockResolvedValueOnce(null);
      user_repository.find_user_by_id.mockResolvedValueOnce(null);
      await expect(userServices.get_user_by_id(1)).rejects.toThrow(AppError);
    });

    it('should return user from cache if it exists', async () => {
      const mockUser = { id: 1 };
      Redis.get.mockResolvedValueOnce(JSON.stringify(mockUser));
      const result = await userServices.get_user_by_id(1);
      expect(result).toEqual(mockUser);
      expect(user_repository.find_user_by_id).not.toHaveBeenCalled();
    });

    it('should return user from db and cache it if not in cache', async () => {
      const mockUser = { id: 1 };
      Redis.get.mockResolvedValueOnce(null);
      user_repository.find_user_by_id.mockResolvedValueOnce(mockUser);
      const result = await userServices.get_user_by_id(1);
      expect(result).toEqual(mockUser);
      expect(Redis.set).toHaveBeenCalledWith('user:1', JSON.stringify(mockUser), { EX: 300 });
    });
  });

  describe('get_user_details_by_id', () => {
    it('should throw AppError if user not found', async () => {
      user_repository.find_user_details_by_id.mockResolvedValueOnce(null);
      await expect(userServices.get_user_details_by_id(1, 2)).rejects.toThrow(AppError);
    });

    it('should throw AppError if private and not followed', async () => {
      user_repository.find_user_details_by_id.mockResolvedValueOnce({ id: 1, is_private: true });
      verify_user_privacy.mockRejectedValueOnce(new AppError('Access denied', 403));
      await expect(userServices.get_user_details_by_id(1, 2)).rejects.toThrow(AppError);
    });

    it('should return user if private and followed', async () => {
      const mockUser = { id: 1, is_private: true };
      user_repository.find_user_details_by_id.mockResolvedValueOnce(mockUser);
      verify_user_privacy.mockResolvedValueOnce();
      const result = await userServices.get_user_details_by_id(1, 2);
      expect(result).toEqual(mockUser);
    });

    it('should return user if public', async () => {
      const mockUser = { id: 1, is_private: false };
      user_repository.find_user_details_by_id.mockResolvedValueOnce(mockUser);
      verify_user_privacy.mockResolvedValueOnce();
      const result = await userServices.get_user_details_by_id(1, 2);
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove_user_by_id', () => {
    it('should throw AppError if user not found', async () => {
      user_repository.find_user_by_id.mockResolvedValueOnce(null);
      await expect(userServices.remove_user_by_id(1)).rejects.toThrow(AppError);
    });

    it('should delete user and clear cache', async () => {
      user_repository.find_user_by_id.mockResolvedValueOnce({ id: 1 });
      user_repository.delete_user_by_id.mockResolvedValueOnce();
      await userServices.remove_user_by_id(1);
      expect(user_repository.delete_user_by_id).toHaveBeenCalledWith(1);
      expect(Redis.del).toHaveBeenCalledWith('user:1');
    });
  });

  describe('change_user_information', () => {
    it('should throw AppError if user not found', async () => {
      user_repository.find_user_by_id.mockResolvedValueOnce(null);
      await expect(userServices.change_user_information(1, {})).rejects.toThrow(AppError);
    });

    it('should update user and clear cache', async () => {
      user_repository.find_user_by_id.mockResolvedValueOnce({ id: 1 });
      user_repository.update_user_by_id.mockResolvedValueOnce({ id: 1, name: 'new' });
      const result = await userServices.change_user_information(1, { name: 'new' });
      expect(user_repository.update_user_by_id).toHaveBeenCalledWith(1, { name: 'new' });
      expect(Redis.del).toHaveBeenCalledWith('user:1');
      expect(result).toEqual({ id: 1, name: 'new' });
    });
  });

  describe('change_user_password', () => {
    it('should throw AppError if user not found', async () => {
      user_repository.find_user_by_id.mockResolvedValueOnce(null);
      await expect(userServices.change_user_password(1, {})).rejects.toThrow(AppError);
    });

    it('should throw AppError if old password incorrect', async () => {
      user_repository.find_user_by_id.mockResolvedValueOnce({ id: 1, password: 'hash' });
      verify_password.mockResolvedValueOnce(false);
      await expect(userServices.change_user_password(1, { old_password: 'wrong' })).rejects.toThrow(AppError);
    });

    it('should update password and clear cache', async () => {
      user_repository.find_user_by_id.mockResolvedValueOnce({ id: 1, password: 'hash' });
      verify_password.mockResolvedValueOnce(true);
      hash_password.mockResolvedValueOnce('new_hash');
      user_repository.update_user_by_id.mockResolvedValueOnce();
      
      await userServices.change_user_password(1, { old_password: 'old', new_password: 'new' });
      
      expect(user_repository.update_user_by_id).toHaveBeenCalledWith(1, { password: 'new_hash' });
      expect(Redis.del).toHaveBeenCalledWith('user:1');
    });
  });

  describe('search_users', () => {
    it('should return searched users', async () => {
      const mockUsers = [{ id: 1 }];
      user_repository.search_users.mockResolvedValueOnce(mockUsers);
      const result = await userServices.search_users('test', 2);
      expect(result).toEqual(mockUsers);
    });
  });
});
