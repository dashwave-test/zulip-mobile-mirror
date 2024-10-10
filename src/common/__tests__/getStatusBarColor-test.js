/* @flow strict-local */
import { getStatusBarColor } from '../styles/statusBar';
import Orientation from 'react-native-orientation-locker';

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

  test('returns adjusted color for landscape mode in dark theme', () => {
    expect(getStatusBarColor(undefined, themeDark, 'LANDSCAPE')).toEqual('black');
  });

  test('returns adjusted color for landscape mode in light theme', () => {
    expect(getStatusBarColor(undefined, themeLight, 'LANDSCAPE')).toEqual('white');
  });
});
