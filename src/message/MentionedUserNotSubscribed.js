/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View, TouchableOpacity } from 'react-native';

import type { Stream, UserOrBot, Subscription } from '../types';
import { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import * as api from '../api';
import ZulipButton from '../common/ZulipButton';
import ZulipTextIntl from '../common/ZulipTextIntl';
import { getAuth } from '../selectors';
import { kWarningColor } from '../styles/constants';
import { getFullNameReactText } from '../users/userSelectors';
import { getRealm } from '../directSelectors';

type Props = $ReadOnly<{|
  user: UserOrBot,
  stream: Subscription | {| ...Stream, in_home_view: boolean |},
  onDismiss: (user: UserOrBot) => void,
|}>;

const styles = createStyleSheet({
  outer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: kWarningColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  text: {
    flex: 1,
    color: 'black',
  },

  button: {
    backgroundColor: 'orange',

    // Based on MarkAsReadButton.
    // TODO make these less ad hoc.
    // TODO also make the actual touch target taller, like 48px.
    //   (Can extend beyond the visual representation of the button itself.)
    borderWidth: 0,
    borderRadius: 16,
    height: 32,
    paddingLeft: 12,
    paddingRight: 12,
  },
  buttonText: {
    color: 'black',
  },
});

export default function MentionedUserNotSubscribed(props: Props): Node {
  const { user, stream, onDismiss } = props;
  const auth = useSelector(getAuth);
  const enableGuestUserIndicator = useSelector(state => getRealm(state).enableGuestUserIndicator);

  const handleDismiss = useCallback(() => {
    onDismiss(user);
  }, [user, onDismiss]);

  const subscribeToStream = useCallback(() => {
    // This still uses a stream name (#3918) because the API method does; see there.
    api.subscriptionAdd(auth, [{ name: stream.name }], [user.email]);
    handleDismiss();
  }, [auth, handleDismiss, stream, user]);

  return (
    <View>
      <TouchableOpacity onPress={handleDismiss} style={styles.outer}>
        <ZulipTextIntl
          text={{
            text: '{username} will not be notified unless you subscribe them to this stream.',
            values: {
              username: (
                <ZulipTextIntl
                  inheritColor
                  inheritFontSize
                  text={getFullNameReactText({ user, enableGuestUserIndicator })}
                />
              ),
            },
          }}
          style={styles.text}
        />
        <ZulipButton
          style={styles.button}
          textStyle={styles.buttonText}
          text="Subscribe"
          onPress={subscribeToStream}
        />
      </TouchableOpacity>
    </View>
  );
}
