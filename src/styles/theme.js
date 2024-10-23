/* @flow strict-local */
import React from 'react';
import type { Context } from 'react';

import type { ThemeName } from '../reduxTypes';

export type ThemeData = {|
  themeName: ThemeName,
  color: string,
  backgroundColor: string,
  cardColor: string,
  dividerColor: string,
  statusBarColor: string,
|};

export const themeData: {| [name: ThemeName]: ThemeData |} = {
  dark: {
    themeName: 'dark',
    color: 'hsl(210, 11%, 85%)',
    backgroundColor: 'hsl(212, 28%, 18%)',
    cardColor: 'hsl(212, 31%, 21%)',
    // Dividers follow Material Design: opacity 12% black or 12% white.
    // See https://material.io/guidelines/components/dividers.html
    dividerColor: 'hsla(0, 0%, 100%, 0.12)',
    statusBarColor: 'hsl(212, 28%, 21%)', // added for high contrast
  },
  light: {
    themeName: 'light',
    color: 'hsl(0, 0%, 20%)',
    backgroundColor: 'white',
    cardColor: 'hsl(0, 0%, 97%)',
    // Dividers follow Material Design: opacity 12% black or 12% white.
    // See https://material.io/guidelines/components/dividers.html
    dividerColor: 'hsla(0, 0%, 0%, 0.12)',
    statusBarColor: 'white', // consistent with light theme
  },
};

export const ThemeContext: Context<ThemeData> = React.createContext(themeData.light);
