/* @flow strict-local */
import { StatusBar } from 'react-native';
// existing imports ...

// Define colors specific for landscape mode
const landscapeModeColors = {
  light: 'hsl(0, 0%, 20%)',
  dark: 'hsl(210, 11%, 85%)',
};

export const getStatusBarColor = (color: ?string, theme: 'light' | 'dark', mode: 'portrait' | 'landscape' = 'portrait') => {
  if (color) {
    return color;
  }

  if (mode === 'landscape') {
    return theme === 'light' ? landscapeModeColors.light : landscapeModeColors.dark;
  }

  return theme === 'light' ? 'white' : 'hsl(212, 28%, 18%)';
};

// This function sets the status bar color based on the given parameter
export const setStatusBarColor = (color: string, mode: 'portrait' | 'landscape' = 'portrait') => {
  StatusBar.setBackgroundColor(color, true);
  if (mode === 'landscape') {
    StatusBar.setBarStyle('light-content', true);
  } else {
    StatusBar.setBarStyle(color === 'white' ? 'dark-content' : 'light-content', true);
  }
};

// existing code ...
