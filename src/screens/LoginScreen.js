/* @flow strict-local */
import React from 'react';
import { View, Text, Button } from 'react-native';
import { InfoButton } from '../nav/NavButton';

const LoginScreen = ({ navigation }) => {
  const handleInfoPress = () => {
    navigation.navigate('WebViewScreen', { url: 'https://zulip.com/help/' });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Login Page</Text>
      {/* Other login components */}
      <InfoButton onPress={handleInfoPress} />
    </View>
  );
};

export default LoginScreen;
