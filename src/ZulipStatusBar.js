/* @flow strict-local */
import React from 'react';
import { StatusBar, useWindowDimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getStatusBarColor, getStatusBarStyle } from './styles/statusBar';
import Orientation from 'react-native-orientation-locker';

/**
 * Get adjusted status bar color based on orientation.
 * @param color The desired color.
 * @param theme The current theme.
 * @param orientation The device's orientation.
 * @returns The adjusted bar color.
 */
const adjustStatusBarForOrientation = (color, theme, orientation) => {
  if (orientation === 'LANDSCAPE') {
    return theme === 'dark' ? 'black' : 'white';
  }
  return getStatusBarColor(color, theme);
};

type Props = $ReadOnly<{|
  backgroundColor: string,
  theme: 'default' | 'dark',
|}>;

export default function ZulipStatusBar(props: Props): Node {
  const { backgroundColor, theme } = props;
  const isFocused = useIsFocused();
  const { width, height } = useWindowDimensions();
  const orientation = width > height ? 'LANDSCAPE' : 'PORTRAIT';

  return isFocused ? (
    <StatusBar
      backgroundColor={adjustStatusBarForOrientation(backgroundColor, theme, orientation)}
      barStyle={getStatusBarStyle(backgroundColor)}
    />
  ) : null;
}
