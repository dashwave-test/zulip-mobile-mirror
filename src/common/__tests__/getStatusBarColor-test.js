/* @flow strict-local */
import { getStatusBarColor } from '../ZulipStatusBar';

const themeDark = 'dark';
const themeLight = 'light';

describe('getStatusBarColor', () => {
  test('returns specific color when given, regardless of theme', () => {
    expect(getStatusBarColor('#fff', themeLight)).toEqual('#fff');
    expect(getStatusBarColor('#fff', themeDark)).toEqual('#fff');
  });

  test('returns color according to theme for default case', () => {
    expect(getStatusBarColor(undefined, themeLight)).toEqual('white');
    expect(getStatusBarColor(undefined, themeDark)).toEqual('hsl(212, 28%, 18%)');
  });

  test('returns high-contrast color in landscape mode', () => {
    expect(getStatusBarColor(undefined, themeLight, 'landscape')).toEqual('black');
    expect(getStatusBarColor(undefined, themeDark, 'landscape')).toEqual('white');
  });
});
