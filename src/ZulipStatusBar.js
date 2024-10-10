/* @flow strict-local */
import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { useOrientation } from './utils/orientation';

const LIGHT_CONTENT = 'light-content';
const DARK_CONTENT = 'dark-content';

/**
 * Get the appropriate status bar style given a background color.
 * - Bright colors should use dark-content.
 * - Dark colors should use light-content.
 *
 * In landscape mode, use a higher contrast style.
 */
function getStatusBarStyle(color: ?string, isLandscape: boolean) {
  if (!color || color === 'transparent') {
    return isLandscape ? LIGHT_CONTENT : DARK_CONTENT;
  }

  const luminance = parseInt(color.slice(1), 16) * 0.000015259;  // rough luminance from hex
  if (luminance > 0.5) {
    return isLandscape ? DARK_CONTENT : LIGHT_CONTENT;
  }
  return isLandscape ? LIGHT_CONTENT : DARK_CONTENT;
}

type Props = $ReadOnly<{|
  backgroundColor?: string,
  barStyle?: string,
|}>;

/**
 * A wrapper component over StatusBar for consistent color evaluation.
 */
export default function ZulipStatusBar({ backgroundColor, barStyle }: Props) {
  const isLandscape = useOrientation();

  return (
    <StatusBar
      backgroundColor={backgroundColor}
      barStyle={barStyle || getStatusBarStyle(backgroundColor, isLandscape)}
    />
  );
}
