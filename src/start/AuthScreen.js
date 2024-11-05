/* @flow strict-local */
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import type { Node } from 'react';
import { useNavigation } from '@react-navigation/native';

const AuthScreen = (): Node => {
  const navigation = useNavigation();

  const handleInfoPress = () => {
    navigation.navigate('documentation');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {/* Other login components */}
      <Button title="Info" onPress={handleInfoPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default AuthScreen;
