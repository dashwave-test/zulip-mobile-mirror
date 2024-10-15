/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, Text, Button, ToastAndroid } from 'react-native';
import { useDispatch } from '../react-redux';
import { setSubscriptionProperty } from '../api/subscriptions/setSubscriptionProperty';

type Props = {|
  streamId: number,
  isPrivate: boolean,
|};

export default function StreamSettingsModal(props: Props): Node {
  const { streamId, isPrivate } = props;
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const togglePrivacy = useCallback(async () => {
    setLoading(true);
    try {
      await setSubscriptionProperty(auth, streamId, 'invite_only', !isPrivate);
      ToastAndroid.show('Stream privacy updated successfully', ToastAndroid.SHORT);
    } catch (error) {
      ToastAndroid.show('Failed to update stream privacy', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  }, [dispatch, streamId, isPrivate]);

  return (
    <View>
      <Text>Stream Settings</Text>
      <Button title={`Make ${isPrivate ? 'Public' : 'Private'}`} onPress={togglePrivacy} disabled={loading} />
    </View>
  );
}
