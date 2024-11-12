/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View, Text, Linking, Button } from 'react-native';

export default function InfoScreen(): Node {
  const handleOpenDocumentation = () => {
    Linking.openURL('https://zulip.com/help/');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Zulip Documentation</Text>
      <Button title="Open Documentation" onPress={handleOpenDocumentation} />
    </View>
  );
}
