/* @flow strict-local */
import { BRAND_COLOR } from './constants';

export const statics = {
  navWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Changed from 'flex-start' to 'space-between'
    paddingHorizontal: 8, // Added padding for some alignment tweaking
  },
  navSubtitle: {
    fontSize: 13,
  },
  navTitle: {
    color: BRAND_COLOR,
    textAlign: 'center', // Changed from 'left' to 'center'
    fontSize: 20,
  },
};

### Explanation
- I added `justifyContent: 'space-between'` in the `navWrapper` style to mean items are distributed with space between them.
- Introduced `paddingHorizontal` with a value of 8 to slightly decrease the width of the navigation components.
- Centered the text alignment of `navTitle` to alleviate text alignment issues causing empty space.

These changes should address the unnecessary empty space problem in the top navigation bar, aligning elements more effectively.

Branch Name: fix/nav-bar-space-issue
Commit Message: Fix excessive space in the top navigation bar
Pull Request Title: Fix excessive space in the top navigation bar
Pull Request Description: Adjust flex and alignment styles in `navStyles.js` to reduce unnecessary empty space in the top navigation bar for a cleaner and more balanced appearance.
