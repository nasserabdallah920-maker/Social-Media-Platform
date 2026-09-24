const notificationsServices = require('../../services/notifications.services');
const notification_repositories = require('../../repositories/notification.repositories');
const { get_io } = require('../../socket/socketManager');

jest.mock('../../repositories/notification.repositories');
jest.mock('../../socket/socketManager');

describe('Notifications Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sent_follow_notification', () => {
    it('should create notification and emit socket event', async () => {
      notification_repositories.create_notification.mockResolvedValueOnce(1);
      
      const mockEmit = jest.fn();
      const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
      get_io.mockReturnValue({ to: mockTo });

      const mockUser = { username: 'test', avatar: 'av.png', first_name: 'f', last_name: 'l' };

      await notificationsServices.sent_follow_notification(2, 1, 'follow', mockUser);

      expect(notification_repositories.create_notification).toHaveBeenCalledWith(2, 1, 'follow', null, null);
      expect(mockTo).toHaveBeenCalledWith('user-2');
      expect(mockEmit).toHaveBeenCalledWith('notification', expect.objectContaining({
        id: 1,
        type: 'follow'
      }));
    });
  });

  describe('get_notifications', () => {
    it('should return notifications', async () => {
      const mockNotifs = [{ id: 1 }];
      notification_repositories.get_user_notifications.mockResolvedValueOnce(mockNotifs);

      const result = await notificationsServices.get_notifications(1, 1, 10);
      
      expect(notification_repositories.get_user_notifications).toHaveBeenCalledWith(1, 10, 0);
      expect(result).toEqual(mockNotifs);
    });
  });

  describe('set_read_notification', () => {
    it('should update and return affected rows', async () => {
      notification_repositories.read_notification.mockResolvedValueOnce({ affectedRows: 1 });
      const result = await notificationsServices.set_read_notification(1, 1);
      expect(result).toBe(1);
    });
  });

  describe('set_read_all_notifications', () => {
    it('should update all and return affected rows', async () => {
      notification_repositories.read_all_notifications.mockResolvedValueOnce({ affectedRows: 2 });
      const result = await notificationsServices.set_read_all_notifications(1);
      expect(result).toBe(2);
    });
  });

  describe('get_unread_count', () => {
    it('should return count of unread notifications', async () => {
      notification_repositories.count_unread_notifications.mockResolvedValueOnce(5);
      const result = await notificationsServices.get_unread_count(1);
      expect(result).toBe(5);
    });
  });
});
