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
    expect(getStatusBarColor(undefined, themeDark)).toEqual('hsl(222, 99%, 69%)');
  });
});

Branch Name: fix/status-bar-color-landscape
Commit Message: Fix status bar color mismatch in landscape mode
Pull Request Title: Fix status bar color for landscape mode
Pull Request Description: Updated ZulipStatusBar to handle landscape orientation with high contrast colors for better visibility. Updated tests accordingly.
