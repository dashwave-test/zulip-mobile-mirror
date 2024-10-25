/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type UserId } from '../api/idTypes';
import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import { useDispatch, useSelector } from '../react-redux';
import { tryStopNotifications } from '../notification/notifTokens';
import AccountDetails from './AccountDetails';
import { getRealm } from '../directSelectors';
import { getOwnUser, getOwnUserId } from '../users/userSelectors';
import { getAuth, getAccount, getZulipFeatureLevel } from '../account/accountsSelectors';
import { useNavigation } from '../react-navigation';
import { logout } from '../account/logoutActions';
import NavRow from '../common/NavRow';
import { emojiTypeFromReactionType } from '../emoji/data';
import { showConfirmationDialog } from '../utils/info';
import { getUserStatus } from '../user-statuses/userStatusesModel';
import { OfflineNoticePlaceholder } from '../boot/OfflineNoticeProvider';
import * as api from '../api';

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'profile'>,
  route: RouteProp<'profile', void>,
|}>;

/**
 * The profile/settings/account screen we offer among the main tabs of the app.
 */
export default function ProfileScreen(props: Props): Node {
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const auth = useSelector(getAuth);
  const zulipFeatureLevel = useSelector(getZulipFeatureLevel);
  const ownUser = useSelector(getOwnUser);
  const ownUserId = useSelector(getOwnUserId);
  const presenceEnabled = useSelector(state => getRealm(state).presenceEnabled);

  const awayStatus = useSelector(state => getUserStatus(state, ownUserId).away);
  const userStatus = useSelector(state => getUserStatus(state, ownUserId));
  const account = useSelector(getAccount);
  const { status_emoji, status_text } = userStatus;

  return (
    <SafeAreaView mode="padding" edges={['top']} style={{ flex: 1 }}>
      <OfflineNoticePlaceholder />
      <ScrollView>
        <AccountDetails user={ownUser} showEmail={false} showStatus={false} />
        <NavRow
          leftElement={
            status_emoji != null
              ? {
                  type: 'emoji',
                  emojiCode: status_emoji.emoji_code,
                  emojiType: emojiTypeFromReactionType(status_emoji.reaction_type),
                }
              : undefined
          }
          title="Set your status"
          subtitle={status_text}
          onPress={() => {
            navigation.push('user-status');
          }}
        />
        {zulipFeatureLevel >= 148 ? (
          <NavRow
            title="Invisible mode"
            subtitle={!(presenceEnabled) ? "Enabled" : "Disabled"}
            onPress={() => {
              api.updateUserSettings(auth, { presence_enabled: presenceEnabled }, zulipFeatureLevel);
            }}
          />
        ) : (
          // TODO: Remove the following once server supports invisible mode
          <NavRow
            title="Set yourself to away"
            subtitle={awayStatus ? "Enabled" : "Disabled"}
            onPress={() => {
              api.updateUserStatus(auth, { away: !awayStatus });
            }}
          />
        )}
        <NavRow
          title="Full profile"
          onPress={() => {
            navigation.push('account-details', { userId: ownUserId });
          }}
        />
        <NavRow
          title="Settings"
          onPress={() => {
            navigation.push('settings');
          }}
        />
        <NavRow
          title="Switch account"
          onPress={() => {
            navigation.push('account-pick');
          }}
        />
        <NavRow
          title="Log out"
          onPress={() => {
              showConfirmationDialog({
                destructive: true,
                title: 'Log out',
                message: {
                  text: 'This will log out {email} on {realmUrl} from the mobile app on this device.',
                  values: { email: account.email, realmUrl: account.realm.toString() },
                },
                onPressConfirm: () => {
                  dispatch(tryStopNotifications(account));
                  dispatch(logout());
                },
              });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

