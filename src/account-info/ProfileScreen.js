/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { getZulipFeatureLevel } from '../account/accountsSelectors';
import AccountDetails from './AccountDetails';
import { getOwnUser, getOwnUserId } from '../users/userSelectors';
import { getRealm, getAuth } from '../directSelectors';
import NavRow from '../common/NavRow';
import SwitchRow from '../common/SwitchRow';
import * as api from '../api';
import { showConfirmationDialog } from '../utils/info';
import { noTranslation } from '../i18n/i18n';
import { emojiTypeFromReactionType } from '../emoji/data';

const styles = createStyleSheet({
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  button: {
    flex: 1,
    margin: 8,
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
  const navigation = props.navigation;

  const auth = useSelector(getAuth);
  const zulipFeatureLevel = useSelector(getZulipFeatureLevel);
  const ownUser = useSelector(getOwnUser);
  const ownUserId = useSelector(getOwnUserId);
  const presenceEnabled = useSelector(state => getRealm(state).presenceEnabled);
  const awayStatus = useSelector(state => getUserStatus(state, ownUserId).away);
  const userStatus = useSelector(state => getUserStatus(state, ownUserId));

  const { status_emoji, status_text } = userStatus;

  const handleLogout = () => {
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
      _,
    });
  };

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
          subtitle={status_text != null ? noTranslation(status_text) : undefined}
          onPress={() => {
            navigation.push('user-status');
          }}
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
          onPress={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
