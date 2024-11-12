/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AuthScreen(): Node {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to the Auth Screen</Text>
      <Button
        title="Info"
        onPress={() => navigation.navigate('info')}
      />
    </View>
  );
}
