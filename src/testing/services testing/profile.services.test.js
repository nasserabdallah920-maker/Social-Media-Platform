const profileServices = require('../../services/profile.services');
const profile_repository = require('../../repositories/profile.repositories');
const AppError = require('../../utils/apperror');
const Redis = require('../../config/redis.config');

jest.mock('../../repositories/profile.repositories');
jest.mock('../../config/redis.config');

describe('Profile Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update_profile', () => {
    it('should throw AppError if profile not found', async () => {
      profile_repository.find_profile_by_user_id.mockResolvedValueOnce(null);
      await expect(profileServices.update_profile(1, {})).rejects.toThrow(AppError);
    });

    it('should update and return profile and clear cache', async () => {
      profile_repository.find_profile_by_user_id.mockResolvedValueOnce({ user_id: 1 });
      profile_repository.update_profile_by_user_id.mockResolvedValueOnce({ user_id: 1, bio: 'new' });

      const result = await profileServices.update_profile(1, { bio: 'new' });
      
      expect(profile_repository.update_profile_by_user_id).toHaveBeenCalledWith(1, { bio: 'new' });
      expect(Redis.del).toHaveBeenCalledWith('profile:1');
      expect(result.bio).toBe('new');
    });
  });



  describe('toggle_privacy_status', () => {
    it('should throw AppError if profile not found', async () => {
      profile_repository.find_profile_by_user_id.mockResolvedValueOnce(null);
      await expect(profileServices.toggle_privacy_status(1)).rejects.toThrow(AppError);
    });

    it('should toggle and return new privacy status and clear cache', async () => {
      profile_repository.find_profile_by_user_id.mockResolvedValueOnce({ user_id: 1, is_private: false });
      profile_repository.update_profile_by_user_id.mockResolvedValueOnce();

      const result = await profileServices.toggle_privacy_status(1);
      
      expect(profile_repository.update_profile_by_user_id).toHaveBeenCalledWith(1, { is_private: true });
      expect(Redis.del).toHaveBeenCalledWith('profile:1');
      expect(result).toBe(true);
    });
  });
});
