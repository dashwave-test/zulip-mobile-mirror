import React, { useContext } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AccountDetails from './AccountDetails';
import NavRow from '../common/NavRow';
import TextRow from '../common/TextRow';
import { getAuth, getAccount } from '../account/accountsSelectors';
import { getOwnUser, getOwnUserId } from '../users/userSelectors';
import { logout, tryStopNotifications } from '../account/logoutActions';
import { showConfirmationDialog } from '../utils/info';
import { useNavigation } from '../react-navigation';
import { TranslationContext } from '../boot/TranslationProvider';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const auth = useSelector(getAuth);
  const account = useSelector(getAccount);
  const ownUser = useSelector(getOwnUser);
  const ownUserId = useSelector(getOwnUserId);
  const dispatch = useDispatch();
  const _ = useContext(TranslationContext);

  const handleLogout = async () => {
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
      _,
    });
  };

  return (
    <SafeAreaView mode="padding" edges={['top']} style={{ flex: 1 }}>
      <ScrollView>
        <AccountDetails user={ownUser} showEmail={false} showStatus={false} />
        <NavRow
          title="Set your status"
          onPress={() => navigation.push('user-status')}
        />
        <NavRow
          title="Full profile"
          onPress={() => navigation.push('account-details', { userId: ownUserId })}
        />
        <NavRow
          title="Settings"
          onPress={() => navigation.push('settings')}
       />
        <NavRow
          title="Switch account"
          onPress={() => navigation.push('account-pick')}
        />
        <TextRow
          title="Log out"
          destructive
          onPress={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
