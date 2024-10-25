/* @flow strict-local */
import { getStatusBarColor } from '../ZulipStatusBar';

const themeDark = 'dark';
const themeLight = 'light';

describe('getStatusBarColor', () => {
  test('returns specific color when given, regardless of theme', () => {
    expect(getStatusBarColor('#fff', themeLight, 'PORTRAIT')).toEqual('#fff');
    expect(getStatusBarColor('#fff', themeDark, 'PORTRAIT')).toEqual('#fff');
  });

  test('returns color according to theme for default case in portrait', () => {
    expect(getStatusBarColor(undefined, themeLight, 'PORTRAIT')).toEqual('white');
    expect(getStatusBarColor(undefined, themeDark, 'PORTRAIT')).toEqual('hsl(212, 28%, 18%)');
  });

  test('returns color according to theme for default case in landscape', () => {
    expect(getStatusBarColor(undefined, themeLight, 'LANDSCAPE')).toEqual('lightgray');
    expect(getStatusBarColor(undefined, themeDark, 'LANDSCAPE')).toEqual('hsl(212, 28%, 25%)');
  });
});
