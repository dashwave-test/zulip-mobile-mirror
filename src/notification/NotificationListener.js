/* @flow strict-local */
import { DeviceEventEmitter, Platform, NativeModules, NativeEventEmitter } from 'react-native';
import type { PushNotificationEventName } from '@react-native-community/push-notification-ios';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import invariant from 'invariant';

import type { JSONableDict } from '../utils/jsonable';
import type { GlobalDispatch } from '../types';
import { androidGetToken, handleDeviceToken } from './notifTokens';
import type { Notification } from './types';
import * as logging from '../utils/logging';
import { fromAPNs } from './extract';
import { narrowToNotification } from './notifOpen';

// TODO: Could go in a separate file, with some thin wrapper perhaps.
const iosNativeEventEmitter =
  Platform.OS === 'ios'
    ? new NativeEventEmitter<{| +response: [JSONableDict] |}>(NativeModules.ZLPNotificationsEvents)
    : null;

/**
 * From ios/RNCPushNotificationIOS.m in @rnc/push-notification-ios at 1.2.2.
 */
type NotificationRegistrationFailedEvent = {|
  // NSError.localizedDescription, see
  // https://developer.apple.com/documentation/foundation/nserror/1414418-localizeddescription
  message: string,

  // NSError.code, see
  // https://developer.apple.com/documentation/foundation/nserror/1409165-code
  code: number,

  // NSError.userInfo, see
  // https://developer.apple.com/documentation/foundation/nserror/1411580-userinfo
  details: JSONableDict,
|};

/**
 * Listens for notification-related events.
 *
 * An instance of this doesn't affect the subscriptions of any other
 * instance, or anything else.
 */
export default class NotificationListener {
  dispatch: GlobalDispatch;
  unsubs: Array<() => void> = [];

  constructor(dispatch: GlobalDispatch) {
    this.dispatch = dispatch;
  }

  /** Private. */
  listenIOS(
    args:
      | {| +name: PushNotificationEventName, +handler: (...empty) => void | Promise<void> |}
      | {| +name: 'response', +handler: JSONableDict => void |},
  ) {
    invariant(
      iosNativeEventEmitter != null,
      'NotificationListener: expected `iosNativeEventEmitter` in listenIOS',
    );

    if (args.name === 'response') {
      const { name, handler } = args;
      const sub = iosNativeEventEmitter.addListener(name, handler);
      this.unsubs.push(() => sub.remove());
      return;
    }

    // TODO: Use iosNativeEventEmitter (as above) instead of
    //   PushNotificationIOS (as below) for all iOS events

    // In the native code, the PushNotificationEventName we pass here
    // is mapped to something else (see implementation):
    //
    // 'notification'      -> 'remoteNotificationReceived'
    // 'localNotification' -> 'localNotificationReceived'
    // 'register'          -> 'remoteNotificationsRegistered'
    // 'registrationError' -> 'remoteNotificationRegistrationError'
    const { name, handler } = args;
    PushNotificationIOS.addEventListener(name, handler);
    this.unsubs.push(() => PushNotificationIOS.removeEventListener(name));
  }

  /** Private. */
  listenAndroid(name: string, handler: (...empty) => void | Promise<void>) {
    const subscription = DeviceEventEmitter.addListener(name, handler);
    this.unsubs.push(() => subscription.remove());
  }

  /** Private. */
  unlistenAll() {
    while (this.unsubs.length > 0) {
      this.unsubs.pop()();
    }
  }

  /** Private. */
  handleNotificationOpen: Notification => void = notification => {
    this.dispatch(narrowToNotification(notification));
  };

  /** Private. */
  handleDeviceToken: mixed => Promise<void> = deviceToken =>
    this.dispatch(handleDeviceToken(deviceToken));

  /** Private. */
  handleIOSRegistrationFailure: NotificationRegistrationFailedEvent => void = err => {
    logging.warn(`Failed to register iOS push token: ${err.code}`, {
      raw_error: err,
    });
  };

  /** Start listening.  Don't call twice without intervening `stop`. */
  async start() {
    if (Platform.OS === 'android') {
      // On Android, the object passed to the handler is constructed in
      // FcmMessage.kt, and will always be a Notification.
      this.listenAndroid('notificationOpened', this.handleNotificationOpen);
      this.listenAndroid('remoteNotificationsRegistered', this.handleDeviceToken);
    } else {
      this.listenIOS({
        name: 'response',
        handler: payload => {
          const dataFromAPNs = fromAPNs(payload);
          if (!dataFromAPNs) {
            return;
          }
          this.handleNotificationOpen(dataFromAPNs);
        },
      });
      this.listenIOS({ name: 'register', handler: this.handleDeviceToken });
      this.listenIOS({ name: 'registrationError', handler: this.handleIOSRegistrationFailure });
    }

    if (Platform.OS === 'android') {
      // A bug was introduced in 3730be4c8 that delayed the setup of
      // our listener for 'remoteNotificationsRegistered' until a time
      // after the event was emitted from the native code. Until we
      // settle on a better, more consistent architecture, just grab
      // the token here and do the same thing our handler does (by
      // just calling the handler).
      const token = await this.dispatch(androidGetToken());
      if (token !== null) {
        this.handleDeviceToken(token);
      }
    } else {
      // On iOS, we come back to this later: after the initial fetch, we
      // end up calling `getNotificationToken`, and that will cause us
      // to get the token if the user gives us notification permission.
    }
  }

  /** Stop listening. */
  stop() {
    this.unlistenAll();
  }
}
