/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyleSheet, HALF_COLOR } from '../styles';
import type { LocalizableReactText } from '../types';
import ZulipTextIntl from './ZulipTextIntl';
import ZulipTextButton from './ZulipTextButton';

const styles = createStyleSheet({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: HALF_COLOR,
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
    paddingTop: 10,
  },
  textRow: {
    flexGrow: 1,
    flexDirection: 'row',
    marginBottom: 12,
  },
  text: {
    marginTop: 6,
    lineHeight: 20,
  },
  buttonsRow: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

type Button = $ReadOnly<{|
  id: string,
  label: LocalizableReactText,
  onPress: () => void,
|}>;

type Props = $ReadOnly<{|
  visible: boolean,
  text: LocalizableReactText,
  buttons: $ReadOnlyArray<Button>,
|}>;

/**
 * A banner that follows Material Design specifications as much as possible.
 *
 * See https://material.io/components/banners.
 */
// Please consult the Material Design doc before making layout changes, and
// try to make them in a direction that brings us closer to the guidelines.
export default function ZulipBanner(props: Props): Node {
  const { visible, text, buttons } = props;

  if (!visible) {
    return null;
  }

  return (
    <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.wrapper}>
      <View style={styles.textRow}>
        <ZulipTextIntl style={styles.text} text={text} />
      </View>
      <View style={styles.buttonsRow}>
        {buttons.map(({ id, label, onPress }, index) => (
          <ZulipTextButton
            key={id}
            leftMargin={index !== 0 || undefined}
            label={label}
            onPress={onPress}
          />
        ))}
        <ZulipTextButton
          key="info"
          label="Info"
          onPress={() => Linking.openURL('https://zulip.com/help/')}
        />
      </View>
    </SafeAreaView>
  );
}
