/* @flow strict-local */

export const getStatusBarColor = (color?: string, theme: string, orientation?: string = 'PORTRAIT') => {
  if (orientation === 'LANDSCAPE') {
    return theme === 'dark' ? 'black' : 'white';
  }
  if (color) {
    return color;
  }
  return theme === 'dark' ? 'hsl(212, 28%, 18%)' : 'white';
};

export const getStatusBarStyle = (color?: string) => {
  if (color === '#fff') {
    return 'dark-content';
  }
  if (color === '#000') {
    return 'light-content';
  }
  return 'default';
};
