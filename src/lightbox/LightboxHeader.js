/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { shortTime, humanDate } from '../utils/date';
import { createStyleSheet } from '../styles';
import UserAvatarWithPresence from '../common/UserAvatarWithPresence';
import { Icon } from '../common/Icons';
import { OfflineNoticePlaceholder } from '../boot/OfflineNoticeProvider';
import { useSelector } from '../react-redux';
import { getFullNameReactText, tryGetUserForId } from '../users/userSelectors';
import { getRealm } from '../directSelectors';
import type { Message } from '../api/modelTypes';
import ZulipText from '../common/ZulipText';
import ZulipTextIntl from '../common/ZulipTextIntl';

const styles = createStyleSheet({
  text: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 16,
  },
  name: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subheader: {
    color: 'white',
    fontSize: 12,
  },
  rightIconTouchTarget: {
    alignSelf: 'center',
    marginVertical: 4,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

type Props = $ReadOnly<{|
  message: Message,
  onPressBack: () => void,
|}>;

/**
 * Shows sender's name and date of photo being displayed.
 */
export default function LightboxHeader(props: Props): Node {
  const { onPressBack, message } = props;
  const { timestamp, sender_id: senderId } = message;
  const displayDate = humanDate(new Date(timestamp * 1000));
  const time = shortTime(new Date(timestamp * 1000));
  const subheader = `${displayDate} at ${time}`;

  const sender = useSelector(state => tryGetUserForId(state, senderId));
  const enableGuestUserIndicator = useSelector(state => getRealm(state).enableGuestUserIndicator);

  return (
    <SafeAreaView mode="padding" edges={['top']}>
      <OfflineNoticePlaceholder />
      <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.contentArea}>
        <UserAvatarWithPresence size={36} userId={senderId} />
        <View style={styles.text}>
          <ZulipTextIntl
            style={styles.name}
            numberOfLines={1}
            text={getFullNameReactText({
              user: sender,
              enableGuestUserIndicator,
              fallback: message.sender_full_name,
            })}
          />
          <ZulipText style={styles.subheader} numberOfLines={1}>
            {subheader}
          </ZulipText>
        </View>
        <Pressable style={styles.rightIconTouchTarget} onPress={onPressBack} hitSlop={12}>
          {({ pressed }) => <Icon size={24} color={pressed ? 'gray' : 'white'} name="x" />}
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
}
