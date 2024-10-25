/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type UserId } from '../api/idTypes';
import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import { useDispatch, useSelector } from '../react-redux';
import { logout } from '../account/logoutActions';
import { tryStopNotifications } from '../notification/notifTokens';
import AccountDetails from './AccountDetails';
import { getRealm } from '../directSelectors';
import { getOwnUser, getOwnUserId } from '../users/userSelectors';
import { getAuth, getAccount } from '../account/accountsSelectors';
import { useNavigation } from '../react-navigation';
import { showConfirmationDialog } from '../utils/info';
import { getUserStatus } from '../user-statuses/userStatusesModel';
import { emojiTypeFromReactionType } from '../emoji/data';
import { OfflineNoticePlaceholder } from '../boot/OfflineNoticeProvider';
import SwitchRow from '../common/SwitchRow';
import * as api from '../api';
import { identityOfAccount } from '../account/accountMisc';
import NavRow from '../common/NavRow';
import TextRow from '../common/TextRow';

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
  const ownUser = useSelector(getOwnUser);
  const ownUserId = useSelector(getOwnUserId);
  const presenceEnabled = useSelector(state => getRealm(state).presenceEnabled);
  const userStatus = useSelector(state => getUserStatus(state, ownUserId));
  const { status_emoji, status_text } = userStatus;

  const account = useSelector(getAccount);
  const identity = identityOfAccount(account);

  return (
    <SafeAreaView mode="padding" edges={['top']} style={{ flex: 1 }}>
      <OfflineNoticePlaceholder />
      <ScrollView>
        <AccountDetails user={ownUser} showEmail={false} showStatus={false} />
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
                values: { email: identity.email, realmUrl: identity.realm.toString() },
              },
              onPressConfirm: () => {
                dispatch(tryStopNotifications(account));
                dispatch(logout());
              },
            });
          }}
        />
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
          subtitle={status_text != null ? status_text : undefined}
          onPress={() => {
            navigation.push('user-status');
          }}
        />
        <View style={{ margin: 8 }}>
          <SwitchRow
            label="Invisible mode"
            value={!presenceEnabled}
            onValueChange={(newValue: boolean) => {
              api.updateUserSettings(auth, { presence_enabled: !newValue });
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

