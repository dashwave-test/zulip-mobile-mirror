/* @flow strict-local */
import React from 'react';
import renderer from 'react-test-renderer';
import ZulipStatusBar from '../ZulipStatusBar';

jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: () => ({ width: 600, height: 400 }),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

describe('ZulipStatusBar', () => {
  test('uses light-content for dark background color in landscape mode', () => {
    const tree = renderer.create(<ZulipStatusBar backgroundColor='#000' />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('uses dark-content for light background color in landscape mode', () => {
    const tree = renderer.create(<ZulipStatusBar backgroundColor='#fff' />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('uses specified barStyle prop', () => {
    const tree = renderer.create(<ZulipStatusBar barStyle='dark-content' />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
