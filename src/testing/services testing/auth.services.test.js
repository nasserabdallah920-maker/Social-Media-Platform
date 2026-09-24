const authServices = require('../../services/auth.services');
const repo = require('../../repositories/user.repositories');
const profile_repo = require('../../repositories/profile.repositories');
const { create_tokens, verify_refresh_token } = require('../../utils/jwt');
const { create_payload } = require('../../utils/createPayload');
const { verify_password, hash_password } = require('../../utils/bcrypt');
const AppError = require('../../utils/apperror');
const { transpoter } = require('../../emails/transpoter');

jest.mock('../../repositories/user.repositories');
jest.mock('../../repositories/profile.repositories');
jest.mock('../../utils/jwt');
jest.mock('../../utils/createPayload');
jest.mock('../../utils/bcrypt');
jest.mock('../../emails/transpoter', () => ({
  transpoter: {
    sendMail: jest.fn(),
  },
}));

describe('Auth Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add_user', () => {
    const mockBody = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      user_name: 'johndoe',
    };

    it('should throw AppError if email already exists', async () => {
      repo.find_user_by_email.mockResolvedValueOnce({ id: 1 });
      await expect(authServices.add_user(mockBody)).rejects.toThrow(AppError);
    });

    it('should throw AppError if username already taken', async () => {
      repo.find_user_by_email.mockResolvedValueOnce(null);
      repo.find_user_by_username.mockResolvedValueOnce({ id: 1 });
      await expect(authServices.add_user(mockBody)).rejects.toThrow(AppError);
    });

    it('should create a new user successfully', async () => {
      repo.find_user_by_email.mockResolvedValueOnce(null);
      repo.find_user_by_username.mockResolvedValueOnce(null);
      hash_password.mockResolvedValueOnce('hashed_password');
      
      const mockUser = { id: 1, user_name: 'johndoe' };
      repo.save_user.mockResolvedValueOnce(mockUser);
      
      const mockPayload = { id: 1, role: 'user' };
      create_payload.mockReturnValueOnce(mockPayload);
      
      const mockTokens = { access_token: 'acc_token', refresh_token: 'ref_token' };
      create_tokens.mockReturnValueOnce(mockTokens);
      
      repo.update_user_by_id.mockResolvedValueOnce();
      profile_repo.save_profile.mockResolvedValueOnce();

      const result = await authServices.add_user(mockBody);

      expect(repo.save_user).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        user_name: 'johndoe',
      });
      expect(result).toEqual({
        user: { user_id: 1, user_name: 'johndoe' },
        access_token: 'acc_token',
        refresh_token: 'ref_token',
      });
    });
  });

  describe('user_login', () => {
    it('should throw AppError for incorrect email', async () => {
      repo.find_user_by_email.mockResolvedValueOnce(null);
      await expect(authServices.user_login('test@test.com', 'password')).rejects.toThrow(AppError);
    });

    it('should throw AppError for incorrect password', async () => {
      repo.find_user_by_email.mockResolvedValueOnce({ password: 'hashed' });
      verify_password.mockResolvedValueOnce(false);
      await expect(authServices.user_login('test@test.com', 'wrong_password')).rejects.toThrow(AppError);
    });

    it('should return tokens on successful login', async () => {
      const mockUser = { id: 1, user_name: 'testuser', password: 'hashed' };
      repo.find_user_by_email.mockResolvedValueOnce(mockUser);
      verify_password.mockResolvedValueOnce(true);
      
      create_payload.mockReturnValueOnce({ id: 1 });
      const mockTokens = { access_token: 'acc', refresh_token: 'ref' };
      create_tokens.mockResolvedValueOnce(mockTokens);

      const result = await authServices.user_login('test@test.com', 'password');
      
      expect(result).toEqual({
        user: { user_id: 1, user_name: 'testuser' },
        access_token: 'acc',
        refresh_token: 'ref'
      });
    });
  });
  
  describe('user_log_out', () => {
    it('should update user to nullify refresh token', async () => {
      await authServices.user_log_out(1);
      expect(repo.update_user_by_id).toHaveBeenCalledWith(1, { refresh_token: null });
    });
  });
});
