/* @flow strict-local */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DocumentationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Documentation Page</Text>
      {/* Add more content related to documentation here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});

export default DocumentationScreen;
