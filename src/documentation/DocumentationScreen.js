/* @flow strict-local */
import React from 'react';
import { View, Text, StyleSheet, Linking, Button } from 'react-native';
import type { Node } from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default function DocumentationScreen(): Node {
  const handleOpenDocumentation = () => {
    Linking.openURL('https://your.documentation.url');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>For more information, please visit our documentation page.</Text>
      <Button title="Open Documentation" onPress={handleOpenDocumentation} />
    </View>
  );
}
