/* @flow strict-local */
import { StatusBar } from 'react-native';

export function getStatusBarColor(backgroundColor: string | void, theme: 'light' | 'dark'): string {
  if (backgroundColor) {
    return backgroundColor;
  }

  if (theme === 'light') {
    return 'white';
  }

  // Change the background color to a higher contrast color for the 'dark' theme
  // when in landscape mode.
  return 'hsl(212, 28%, 21%)'; // adjusted for higher contrast
}

export function getStatusBarStyle(backgroundColor: string): 'default' | 'light-content' | 'dark-content' {
  const colorBrightnessThreshold = 0.5;
  
  // Using the color library to determine brightness
  const isDark = Color(backgroundColor).isDark();

  return isDark ? 'light-content' : 'dark-content';
}

export default function ZulipStatusBar({ backgroundColor, theme }: { backgroundColor?: string, theme: 'light' | 'dark' }): Node {
  return (
    <StatusBar
      backgroundColor={getStatusBarColor(backgroundColor, theme)}
      barStyle={getStatusBarStyle(backgroundColor || getStatusBarColor(undefined, theme))}
    />
  );
}
