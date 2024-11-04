/* @flow strict-local */
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();

  const handleInfoPress = () => {
    // Navigate to the documentation page
    navigation.navigate('Documentation');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {/* Other login components like TextInput for username and password */}
      <Button title="Info" onPress={handleInfoPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default LoginScreen;
