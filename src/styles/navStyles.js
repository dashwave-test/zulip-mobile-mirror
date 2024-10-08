/* @flow strict-local */
import { BRAND_COLOR } from './constants';

export const statics = {
  navWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensures elements are spaced evenly
    paddingHorizontal: 10, // Add horizontal padding for balance
  },
  navSubtitle: {
    fontSize: 13,
  },
  navTitle: {
    color: BRAND_COLOR,
    textAlign: 'left',
    fontSize: 20,
  },
};

