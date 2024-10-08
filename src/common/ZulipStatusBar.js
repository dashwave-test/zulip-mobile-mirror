/* @flow strict-local */

import React, { useState, useEffect } from 'react';
import { StatusBar, Dimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const DARK_THEME_COLOR = 'hsl(212, 28%, 18%)';
const LIGHT_THEME_COLOR = 'white';

const getStatusBarColor = (color, theme) => {
  return color || (theme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
};

const getStatusBarStyle = color => {
  return color === '#fff' ? 'dark-content' : 'light-content';
};

const ZulipStatusBar = ({ color: propColor, theme }) => {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const handleOrientationChange = ({ window: { width, height } }) => {
      setIsLandscape(width > height);
    };

    const subscription = Dimensions.addEventListener('change', handleOrientationChange);
    handleOrientationChange(Dimensions.get('window'));  // Initial check

    return () => {
      subscription?.remove();
    };
  }, []);

  const isFocused = useIsFocused();
  const color = isLandscape ? LIGHT_THEME_COLOR : getStatusBarColor(propColor, theme);
  const style = getStatusBarStyle(color);

  return <StatusBar hidden={!isFocused} backgroundColor={color} barStyle={style} />;
};

export { getStatusBarColor, getStatusBarStyle };
export default ZulipStatusBar;
