/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { Stream, Narrow } from '../types';
import { useSelector } from '../react-redux';
import * as api from '../api';
import ZulipButton from '../common/ZulipButton';
import ZulipTextIntl from '../common/ZulipTextIntl';
import { getAuth, getStreamInNarrow } from '../selectors';
import styles from '../styles';

type Props = $ReadOnly<{|
  narrow: Narrow,
|}>;

export default function NotSubscribed(props: Props): Node {
  const auth = useSelector(getAuth);
  const stream: $ReadOnly<{ ...Stream, ... }> = useSelector(state =>
    getStreamInNarrow(state, props.narrow),
  );

  const subscribeToStream = useCallback(() => {
    // This still uses a stream name (#3918) because the API method does; see there.
    api.subscriptionAdd(auth, [{ name: stream.name }]);
  }, [auth, stream]);

  return (
    <View style={styles.disabledComposeBox}>
      <ZulipTextIntl
        style={styles.disabledComposeText}
        text="You are not subscribed to this stream"
      />
      {!stream.invite_only && (
        <ZulipButton
          style={styles.disabledComposeButton}
          text="Subscribe"
          onPress={subscribeToStream}
        />
      )}
    </View>
  );
}
