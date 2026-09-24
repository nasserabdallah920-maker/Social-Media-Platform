const relationsServices = require('../../services/relations.services');
const relations_repository = require('../../repositories/relations.repositories');
const profile_repository = require('../../repositories/profile.repositories');
const user_repositories = require('../../repositories/user.repositories');
const { sent_follow_notification } = require('../../services/notifications.services');
const AppError = require('../../utils/apperror');
const { get_user_details_by_id } = require('../../services/user.services');

jest.mock('../../repositories/relations.repositories');
jest.mock('../../repositories/profile.repositories');
jest.mock('../../repositories/user.repositories');
jest.mock('../../services/notifications.services');
jest.mock('../../services/user.services');

describe('Relations Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('follow_user', () => {
    it('should throw AppError if user tries to follow themselves', async () => {
      await expect(relationsServices.follow_user(1, 1)).rejects.toThrow(AppError);
    });

    it('should throw AppError if there is a block', async () => {
      relations_repository.check_block.mockResolvedValueOnce({ is_blocked: true });
      relations_repository.check_block.mockResolvedValueOnce({ is_blocked: false });
      await expect(relationsServices.follow_user(1, 2)).rejects.toThrow(AppError);
    });

    it('should follow user if public profile', async () => {
      relations_repository.check_block.mockResolvedValue({ is_blocked: false });
      relations_repository.check_follow.mockResolvedValueOnce(false);
      profile_repository.find_profile_by_user_id.mockResolvedValueOnce({ is_private: false });
      
      const mockUser = { id: 1 };
      user_repositories.find_user_details_by_id.mockResolvedValueOnce(mockUser);
      relations_repository.create_follow.mockResolvedValueOnce();
      sent_follow_notification.mockResolvedValueOnce();

      const result = await relationsServices.follow_user(1, 2);
      
      expect(relations_repository.create_follow).toHaveBeenCalledWith(1, 2);
      expect(sent_follow_notification).toHaveBeenCalledWith(2, 1, 'follow', mockUser);
      expect(result).toBe('User followed successfully');
    });

    it('should send request if private profile', async () => {
      relations_repository.check_block.mockResolvedValue({ is_blocked: false });
      relations_repository.check_follow.mockResolvedValueOnce(false);
      profile_repository.find_profile_by_user_id.mockResolvedValueOnce({ is_private: true });
      
      const mockUser = { id: 1 };
      user_repositories.find_user_details_by_id.mockResolvedValueOnce(mockUser);
      relations_repository.check_request.mockResolvedValueOnce(false);
      relations_repository.create_request.mockResolvedValueOnce();
      sent_follow_notification.mockResolvedValueOnce();

      const result = await relationsServices.follow_user(1, 2);
      
      expect(relations_repository.create_request).toHaveBeenCalledWith(1, 2);
      expect(sent_follow_notification).toHaveBeenCalledWith(2, 1, 'follow_request', mockUser);
      expect(result).toBe('Follow request sent successfully');
    });
  });

  describe('unfollow_user', () => {
    it('should delete request if pending', async () => {
      relations_repository.check_request.mockResolvedValueOnce(true);
      relations_repository.delete_request.mockResolvedValueOnce();
      
      const result = await relationsServices.unfollow_user(1, 2);
      
      expect(relations_repository.delete_request).toHaveBeenCalledWith(1, 2);
      expect(result).toBe('Follow request cancelled successfully');
    });

    it('should delete follow if following', async () => {
      relations_repository.check_request.mockResolvedValueOnce(false);
      relations_repository.check_follow.mockResolvedValueOnce(true);
      relations_repository.delete_follow.mockResolvedValueOnce();
      
      const result = await relationsServices.unfollow_user(1, 2);
      
      expect(relations_repository.delete_follow).toHaveBeenCalledWith(1, 2);
      expect(result).toBe('User unfollowed successfully');
    });
  });

  describe('block_user', () => {
    it('should block user and delete mutual relations', async () => {
      relations_repository.check_block.mockResolvedValueOnce({ is_blocked: false });
      relations_repository.create_block.mockResolvedValueOnce();
      relations_repository.delete_follow_mutual.mockResolvedValueOnce();
      relations_repository.delete_request_mutual.mockResolvedValueOnce();
      
      await relationsServices.block_user(1, 2);
      
      expect(relations_repository.create_block).toHaveBeenCalledWith(1, 2);
      expect(relations_repository.delete_follow_mutual).toHaveBeenCalledWith(1, 2);
      expect(relations_repository.delete_request_mutual).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('unblock_user', () => {
    it('should unblock user', async () => {
      relations_repository.check_block.mockResolvedValueOnce({ is_blocked: true });
      relations_repository.delete_block.mockResolvedValueOnce();
      
      await relationsServices.unblock_user(1, 2);
      
      expect(relations_repository.delete_block).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('accept_request', () => {
    it('should accept request and send notification', async () => {
      relations_repository.check_request.mockResolvedValueOnce(true);
      relations_repository.delete_request.mockResolvedValueOnce();
      relations_repository.create_follow.mockResolvedValueOnce();
      
      const mockUser = { id: 2 };
      user_repositories.find_user_details_by_id.mockResolvedValueOnce(mockUser);
      sent_follow_notification.mockResolvedValueOnce();
      
      await relationsServices.accept_request(2, 1);
      
      expect(relations_repository.create_follow).toHaveBeenCalledWith(1, 2);
      expect(sent_follow_notification).toHaveBeenCalledWith(1, 2, 'follow_accept', mockUser);
    });
  });
});
