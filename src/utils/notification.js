// Adjust notification behavior to ensure clicking a notification expands it rather than doing nothing.

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Setup notification behavior configuration
export function configureNotificationBehavior() {
  if (Platform.OS === 'android') {
    // For Android, clicking on a notification should expand to show individual topics.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        showExpansion: true,  // Custom flag for showing expanded notifications
      }),
    });
  }
}
