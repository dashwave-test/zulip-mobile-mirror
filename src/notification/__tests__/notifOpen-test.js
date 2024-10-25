/* @flow strict-local */
import { expandNotification } from '../notifOpen';
import type { Notification } from '../types';

describe('expandNotification', () => {
  test('expands notification with topics', () => {
    const notification: Notification = {
      recipient_type: 'stream',
      stream_name: 'general',
      topic: 'Announcements',
      realm_uri: 'https://example.com',
    };

    console.log = jest.fn();

    expandNotification(notification);

    expect(console.log).toHaveBeenCalledWith('Expanding notification for stream:', 'general');
    expect(console.log).toHaveBeenCalledWith('Topics:', 'Announcements');
  });

  test('does not expand notification without topics', () => {
    const notification: Notification = {
      recipient_type: 'private',
      realm_uri: 'https://example.com',
    };

    console.log = jest.fn();

    expandNotification(notification);

    expect(console.log).toHaveBeenCalledWith('No topics to expand for this notification.');
  });
});
