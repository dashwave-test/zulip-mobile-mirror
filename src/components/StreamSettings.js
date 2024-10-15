/* @flow strict-local */
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';

import { useSelector, useDispatch } from '../react-redux';
import { getSubscriptions } from '../selectors';
import { apiPatch } from '../api/apiFetch';

type Props = {|
  navigation: NavigationScreenProp<*>,

  // Assume the existence of an appropriate state selector in the real system
  streamId: number,
|};

export default function StreamSettings(props: Props) {
  const { navigation, streamId } = props;
  const dispatch = useDispatch();
  const subscriptions = useSelector(getSubscriptions);
  const subscription = subscriptions.find(s => s.stream_id === streamId);

  const handleTogglePrivate = async () => {
    if (!subscription) return;

    try {
      await apiPatch('/users/me/subscriptions/properties', {
        subscription_data: JSON.stringify([
          {
            stream_id: streamId,
            property: 'is_private',
            value: !subscription.invite_only,
          },
        ]),
      });

      alert(`Stream ${subscription.name} has been ${!subscription.invite_only ? 'made private' : 'made public'}.`);
    } catch (error) {
      alert('Failed to update stream privacy settings.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subscription ? subscription.name : 'Loading...'}</Text>
      <Button
        title={`Make this stream ${subscription ? (!subscription.invite_only ? 'private' : 'public') : ''}`}
        onPress={handleTogglePrivate}
        disabled={!subscription}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

