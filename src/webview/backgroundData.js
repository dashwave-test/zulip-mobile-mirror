// @flow strict-local

import type {
  AlertWordsState,
  Auth,
  FlagsState,
  GlobalSettingsState,
  ImageEmoji,
  MuteState,
  MutedUsersState,
  PerAccountState,
  Subscription,
  Stream,
  UserId,
  User,
  UserOrBot,
} from '../types';
import type { UnreadState } from '../unread/unreadModelTypes';
import {
  getAuth,
  getAllImageEmojiById,
  getFlags,
  getAllUsersById,
  getMutedUsers,
  getOwnUser,
  getSettings,
  getSubscriptionsById,
  getStreamsById,
  getRealm,
  getZulipFeatureLevel,
} from '../selectors';
import { getMute } from '../mute/muteModel';
import { getUnread } from '../unread/unreadModel';
import { getUserStatuses } from '../user-statuses/userStatusesModel';
import { type UserStatusesState } from '../user-statuses/userStatusesCore';
import { Role } from '../api/permissionsTypes';
import type { ServerEmojiData } from '../api/modelTypes';

/**
 * Data about the user, the realm, and all known messages.
 *
 * This data is all independent of the specific narrow or specific messages
 * we're displaying; data about those goes elsewhere.
 *
 * We pass this object down to a variety of lower layers and helper
 * functions, where it saves us from individually wiring through all the
 * overlapping subsets of this data they respectively need.
 */
export type BackgroundData = $ReadOnly<{|
  alertWords: AlertWordsState,
  allImageEmojiById: $ReadOnly<{| [id: string]: ImageEmoji |}>,
  auth: Auth,
  flags: FlagsState,
  mute: MuteState,
  allUsersById: Map<UserId, UserOrBot>,
  mutedUsers: MutedUsersState,
  ownUser: User,
  ownUserRole: Role,
  streams: Map<number, Stream>,
  subscriptions: Map<number, Subscription>,
  unread: UnreadState,
  twentyFourHourTime: boolean,
  userSettingStreamNotification: boolean,
  displayEmojiReactionUsers: boolean,
  userStatuses: UserStatusesState,
  zulipFeatureLevel: number,
  serverEmojiData: ServerEmojiData | null,
  enableReadReceipts: boolean,
  enableGuestUserIndicator: boolean,
|}>;

// TODO: Ideally this ought to be a caching selector that doesn't change
//   when the inputs don't.  Doesn't matter in a practical way as used in
//   MessageList, because we memoize the expensive parts of rendering and in
//   generateInboundEvents we check for changes to individual relevant
//   properties of backgroundData, rather than backgroundData itself.  But
//   it'd be better to set an example of the right general pattern.
export const getBackgroundData = (
  state: PerAccountState,
  globalSettings: GlobalSettingsState,
): BackgroundData => {
  const ownUser = getOwnUser(state);
  return {
    alertWords: state.alertWords,
    allImageEmojiById: getAllImageEmojiById(state),
    auth: getAuth(state),
    flags: getFlags(state),
    mute: getMute(state),
    allUsersById: getAllUsersById(state),
    mutedUsers: getMutedUsers(state),
    ownUser,
    ownUserRole: ownUser.role,
    streams: getStreamsById(state),
    subscriptions: getSubscriptionsById(state),
    unread: getUnread(state),
    twentyFourHourTime: getRealm(state).twentyFourHourTime,
    userSettingStreamNotification: getSettings(state).streamNotification,
    displayEmojiReactionUsers: getSettings(state).displayEmojiReactionUsers,
    userStatuses: getUserStatuses(state),
    zulipFeatureLevel: getZulipFeatureLevel(state),
    serverEmojiData: getRealm(state).serverEmojiData,
    enableReadReceipts: getRealm(state).enableReadReceipts,
    enableGuestUserIndicator: getRealm(state).enableGuestUserIndicator,
  };
};
