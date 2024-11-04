/* @flow strict-local */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DocumentationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Documentation</Text>
      <Text style={styles.content}>Here is the documentation content...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DocumentationScreen;
