/* @flow strict-local */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Node } from 'react';

const DocumentationScreen = (): Node => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Documentation</Text>
      <Text style={styles.content}>Here is where the documentation content will be displayed.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default DocumentationScreen;
