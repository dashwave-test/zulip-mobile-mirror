/* @flow strict-local */
import React, { useContext, useMemo } from 'react';
import type { Node } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, StyleSheet } from 'react-native';

import type { LocalizableReactText } from '../types';
import globalStyles, { ThemeContext, NAVBAR_SIZE } from '../styles';
import ZulipTextIntl from '../common/ZulipTextIntl';
import NavBarBackButton from './NavBarBackButton';
import { OfflineNoticePlaceholder } from '../boot/OfflineNoticeProvider';

type Props = $ReadOnly<{|
  canGoBack: boolean,
  title: LocalizableReactText,
|}>;

export default function ModalNavBar(props: Props): Node {
  const { canGoBack, title } = props;
  const { backgroundColor } = useContext(ThemeContext);

  const styles = useMemo(
    () => ({
      text: [
        globalStyles.navTitle,
        { flex: 1 },
        canGoBack
          ? { marginStart: Platform.OS === 'android' ? 20 : 32, marginEnd: 12 }
          : { marginHorizontal: 8 },
      ],
      surface: {
        borderColor: 'hsla(0, 0%, 50%, 0.25)',
        borderBottomWidth: 1,
        backgroundColor,
      },
      contentArea: {
        minHeight: NAVBAR_SIZE,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
      },
    }),
    [canGoBack, backgroundColor],
  );

  return (
    <SafeAreaView mode="padding" edges={['top']} style={styles.surface}>
      <OfflineNoticePlaceholder />
      <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.contentArea}>
        {canGoBack && <NavBarBackButton />}
        <ZulipTextIntl style={styles.text} text={title} numberOfLines={1} ellipsizeMode="tail" />
      </SafeAreaView>
    </SafeAreaView>
  );
}
