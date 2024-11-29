/* @flow strict-local */
import { StatusBar } from 'react-native';
import { useContext } from 'react';
import { ThemeContext } from './styles/theme';

export const getStatusBarColor = (color: string, theme: 'light' | 'dark', orientation?: 'landscape') => {
  if (orientation === 'landscape') {
    return theme === 'light' ? 'black' : 'white';
  }

  if (color) {
    return color;
  }

  return theme === 'light' ? 'white' : 'hsl(212, 28%, 18%)';
};

export const getStatusBarStyle = (color: string, orientation?: 'landscape') => {
  if (orientation === 'landscape') {
    return color === '#000' ? 'light-content' : 'dark-content';
  }

  const theme = useContext(ThemeContext);
  if (color === '#000') {
    return 'light-content';
  }
  return 'dark-content';
};

export const ZulipStatusBar = ({ backgroundColor, orientation }: { backgroundColor: string, orientation?: 'landscape' }) => {
  const theme = useContext(ThemeContext);
  const color = getStatusBarColor(backgroundColor, theme.themeName, orientation);
  const style = getStatusBarStyle(color, orientation);

  return <StatusBar backgroundColor={color} barStyle={style} />;
};
