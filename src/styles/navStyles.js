/* @flow strict-local */
import { BRAND_COLOR } from './constants';

export const statics = {
  navWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Changed to 'center' to remove empty space
  },
  navSubtitle: {
    fontSize: 13,
  },
  navTitle: {
    color: BRAND_COLOR,
    textAlign: 'center',  // Changed to 'center' to align text centrally
    fontSize: 20,
  },
};
