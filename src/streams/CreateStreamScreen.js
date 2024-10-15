/* @flow strict-local */
import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';

import { TranslationContext } from '../boot/TranslationProvider';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useSelector } from '../react-redux';
import { getAuth } from '../selectors';
import { getStreamsByName } from '../subscriptions/subscriptionSelectors';
import Screen from '../common/Screen';
import EditStreamCard from './EditStreamCard';
import { showErrorAlert } from '../utils/info';
import { ApiError } from '../api/apiErrors';
import * as api from '../api';
import { privacyToStreamProps } from './streamsActions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'create-stream'>,
  route: RouteProp<'create-stream', void>,
|}>;

export default function CreateStreamScreen(props: Props): Node {
  const _ = useContext(TranslationContext);
  const { navigation } = props;

  const auth = useSelector(getAuth);
  const streamsByName = useSelector(getStreamsByName);

  const handleComplete = useCallback(
    async ({ name, description, privacy }) => {
      // This will miss existing streams that the client can't know about;
      // for example, a private stream the user can't access. See comment
      // where we catch an `ApiError`, below.
      if (streamsByName.has(name)) {
        showErrorAlert(_('A stream with this name already exists.'));
        return false;
      }

      try {
        await api.createStream(auth, { name, description, ...privacyToStreamProps(privacy) });
        return true;
      } catch (error) {
        if (error instanceof ApiError) {
          showErrorAlert(
            error.message,
            error.code === 'BAD_REQUEST'
              ? _('Cannot make a default stream private. Please deselect it as a default stream first.')
              : undefined,
          );
          return false;
        } else {
          throw error;
        }
      }
    },
    [auth, streamsByName, _],
  );

  return (
    <Screen title="Create new stream" padding>
      <EditStreamCard
        navigation={navigation}
        isNewStream
        initialValues={{ name: '', description: '', privacy: 'public' }}
        onComplete={handleComplete}
      />
    </Screen>
  );
}

