/* @flow strict-local */
import { BRAND_COLOR } from './constants';

export const statics = {
  navWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Change made here to spread the items evenly
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
