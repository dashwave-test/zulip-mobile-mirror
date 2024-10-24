/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type UserId } from '../api/idTypes';
import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { getRealm } from '../directSelectors';
import { getOwnUser, getOwnUserId } from '../users/userSelectors';
import { getAuth, getZulipFeatureLevel } from '../account/accountsSelectors';
import { useNavigation } from '../react-navigation';
import { getUserStatus } from '../user-statuses/userStatusesModel';
import * as api from '../api';
import AccountDetails from './AccountDetails';
import NavRow from '../common/NavRow';
import SwitchRow from '../common/SwitchRow';
import { OfflineNoticePlaceholder } from '../boot/OfflineNoticeProvider';
import { identityOfAccount } from '../account/accountMisc';

const styles = createStyleSheet({
  navRow: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
});

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'profile'>,
  route: RouteProp<'profile', void>,
|}>;

/**
 * The profile/settings/account screen we offer among the main tabs of the app.
 */
export default function ProfileScreen(props: Props): Node {
  const navigation = useNavigation();

  const auth = useSelector(getAuth);
  const zulipFeatureLevel = useSelector(getZulipFeatureLevel);
  const ownUser = useSelector(getOwnUser);
  const ownUserId = useSelector(getOwnUserId);
  const presenceEnabled = useSelector(state => getRealm(state).presenceEnabled);
  const awayStatus = useSelector(state => getUserStatus(state, ownUserId).away);
  const userStatus = useSelector(state => getUserStatus(state, ownUserId));

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
          subtitle={status_text != null ? { text: status_text } : undefined}
          onPress={() => {
            navigation.push('user-status');
          }}
          style={styles.navRow}
        />
        {zulipFeatureLevel >= 148 ? (
          <SwitchRow
            label="Invisible mode"
            value={!(presenceEnabled: boolean)}
            onValueChange={(newValue: boolean) => {
              api.updateUserSettings(auth, { presence_enabled: !newValue }, zulipFeatureLevel);
            }}
          />
        ) : (
          <SwitchRow
            label="Set yourself to away"
            value={awayStatus}
            onValueChange={(away: boolean) => {
              api.updateUserStatus(auth, { away });
            }}
          />
        )}
        <NavRow
          title="Full profile"
          onPress={() => {
            navigation.push('account-details', { userId: ownUserId });
          }}
          style={styles.navRow}
        />
        <NavRow
          title="Settings"
          onPress={() => {
            navigation.push('settings');
          }}
          style={styles.navRow}
        />
        <NavRow
          title="Switch account"
          onPress={() => {
            navigation.push('account-pick');
          }}
          style={styles.navRow}
        />
        <NavRow
          title="Log out"
          onPress={() => {
            const identity = identityOfAccount(useSelector(getAccount));
            showConfirmationDialog({
              destructive: true,
              title: 'Log out',
              message: {
                text: 'This will log out {email} on {realmUrl} from the mobile app on this device.',
                values: { email: identity.email, realmUrl: identity.realm.toString() },
              },
              onPressConfirm: () => {
                tryStopNotifications(useSelector(getAccount));
                logout();
              },
              _,
            });
          }}
          style={styles.navRow}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
