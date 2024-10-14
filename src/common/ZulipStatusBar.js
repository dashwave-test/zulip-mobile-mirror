/* @flow strict-local */
import React from 'react';
import { StatusBar } from 'react-native';
import { useOrientation } from '../state/orientation';

export const getStatusBarColor = (color, theme) => {
  if (color) {
    return color;
  }
  return theme === 'dark' ? 'hsl(212, 28%, 18%)' : 'white';
};

export const getStatusBarStyle = color => {
  return color === '#fff' ? 'dark-content' : 'light-content';
};

const ZulipStatusBar = ({ backgroundColor, theme }) => {
  const orientation = useOrientation();
  const statusBarBackgroundColor = orientation === 'LANDSCAPE' ? 'black' : getStatusBarColor(backgroundColor, theme);
  const statusBarStyle = getStatusBarStyle(statusBarBackgroundColor);

  return <StatusBar
    backgroundColor={statusBarBackgroundColor}
    barStyle={statusBarStyle}
  />;
};

export default ZulipStatusBar;
