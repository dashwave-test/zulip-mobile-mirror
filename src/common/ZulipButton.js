/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View, ActivityIndicator } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native/Libraries/StyleSheet/StyleSheet';
import ZulipTextIntl from './ZulipTextIntl';

import type { LocalizableReactText } from '../types';
import type { SubsetProperties } from '../generics';
import type { SpecificIconType } from './Icons';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import Touchable from './Touchable';

const styles = createStyleSheet({
  frame: {
    height: 44,
    justifyContent: 'center',
    borderRadius: 22,
    overflow: 'hidden',
  },
  primaryFrame: {
    backgroundColor: BRAND_COLOR,
  },
  secondaryFrame: {
    borderWidth: 1.5,
    borderColor: BRAND_COLOR,
  },
  disabledPrimaryFrame: {
    backgroundColor: 'hsla(0, 0%, 50%, 0.4)',
  },
  disabledSecondaryFrame: {
    borderWidth: 1.5,
    borderColor: 'hsla(0, 0%, 50%, 0.4)',
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },

  icon: {
    marginRight: 8,
  },
  primaryIcon: {
    color: 'white',
  },
  secondaryIcon: {
    color: BRAND_COLOR,
  },

  text: {
    fontSize: 16,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: BRAND_COLOR,
  },
  disabledText: {
    color: 'hsla(0, 0%, 50%, 0.8)',
  },
});

// Replacing ZulipButton with TextRow
import TextRow from './TextRow';

export default function ZulipButton(props: Props): Node {
  const {
    style,
    text,
    disabled = false,
    secondary = false,
    progress = false,
    onPress,
    Icon,
    isPressHandledWhenDisabled = false,
  } = props;
  const frameStyle = [
    styles.frame,
    // Prettier bug on nested ternary
    /* prettier-ignore */
    disabled
      ? secondary
        ? styles.disabledSecondaryFrame
        : styles.disabledPrimaryFrame
      : secondary
        ? styles.secondaryFrame
        : styles.primaryFrame,
    style,
  ];
  const textStyle = [
    styles.text,
    disabled ? styles.disabledText : secondary ? styles.secondaryText : styles.primaryText,
    props.textStyle,
  ];
  const iconStyle = [styles.icon, secondary ? styles.secondaryIcon : styles.primaryIcon];

  if (progress) {
    return (
      <View style={frameStyle}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  // Use TextRow if no Icon is provided
  if (!Icon) {
    return (
      <TextRow
        title={text}
        onPress={disabled && !isPressHandledWhenDisabled ? undefined : onPress}
        disabled={disabled ? { title: 'Disabled' } : false}
      />
    );
  }

  return (
    <View style={frameStyle}>
      <Touchable onPress={disabled && !isPressHandledWhenDisabled ? undefined : onPress}>
        <View style={styles.buttonContent}>
          {!!Icon && <Icon style={iconStyle} size={25} />}
          <ZulipTextIntl style={textStyle} text={text} />
        </View>
      </Touchable>
    </View>
  );
}
