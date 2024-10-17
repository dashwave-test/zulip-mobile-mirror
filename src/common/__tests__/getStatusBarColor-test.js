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

  test('handles landscape mode color change based on theme', () => {
    expect(getStatusBarColor(undefined, themeLight, 'landscape')).toEqual('hsl(0, 0%, 20%)');
    expect(getStatusBarColor(undefined, themeDark, 'landscape')).toEqual('hsl(210, 11%, 85%)');
  });
});
