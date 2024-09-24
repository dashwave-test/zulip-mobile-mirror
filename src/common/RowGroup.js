/* @flow strict-local */

import * as React from 'react';
import { View } from 'react-native';

import SwitchRow from './SwitchRow';
import TextRow from './TextRow';
import NavRow from './NavRow';
import type { LocalizableReactText } from '../types';
import { createStyleSheet } from '../styles';
import { QUARTER_COLOR } from '../styles/constants';
import ZulipTextIntl from './ZulipTextIntl';

type Props = $ReadOnly<{|
  /**
   * The current style works best if this ends in a colon.
   */
  // The need to suggest a colon is probably a sign that we can improve the
  // layout in some subtle way.
  title?: LocalizableReactText,

  children: $ReadOnlyArray<
    React$Element<typeof SwitchRow> | React$Element<typeof NavRow> | React$Element<typeof TextRow>,
  >,
|}>;

export default function RowGroup(props: Props): React.Node {
  const { title, children } = props;

  const styles = React.useMemo(
    () =>
      createStyleSheet({
        container: {
          overflow: 'hidden',
          backgroundColor: QUARTER_COLOR, // TODO: Better color
          marginVertical: 4,
        },
        headerContainer: {
          justifyContent: 'center',
          paddingHorizontal: 16,
          paddingVertical: 8,
          minHeight: 48,
        },
      }),
    [],
  );

  return (
    <View style={styles.container}>
      {title != null && (
        <View style={styles.headerContainer}>
          <ZulipTextIntl text={title} />
        </View>
      )}
      {children}
    </View>
  );
}
