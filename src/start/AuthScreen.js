/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { Linking, View } from 'react-native';
import type { NavigationAction } from '@react-navigation/native';

import type { AppNavigationMethods } from '../nav/AppNavigator';
import type { GlobalSettingsState } from '../types';
import { createStyleSheet } from '../styles';
import { BRAND_COLOR } from '../styles';
import { IconInvalidation } from '../common/Icons';
import ModalNavBar from '../nav/ModalNavBar';
import { connectGlobal } from '../react-redux';
import { openLinkWithUserPreference } from '../utils/openLink';
import NavButton from '../nav/NavButton';

const styles = createStyleSheet({
  container: {
    flex: 1,
  },
  button: {
    paddingLeft: 8,
    paddingRight: 8,
  },
});

type Props = $ReadOnly<{|
  navigation: AppNavigationMethods,
  globalSettings: GlobalSettingsState,
  children: Node,
|}>;

class AuthScreen extends PureComponent<Props> {
  handleInfoPress = () => {
    const { globalSettings } = this.props;
    openLinkWithUserPreference(new URL('https://zulip.com/help/'), globalSettings);
  };

  render() {
    const { navigation, children } = this.props;

    return (
      <View style={styles.container}>
        <ModalNavBar
          canGoBack={false}
          title="Log in"
          rightItem={
            <NavButton
              name="info"
              color={BRAND_COLOR}
              onPress={this.handleInfoPress}
              accessibilityLabel="Open documentation"
            />
          }
        />
        {children}
      </View>
    );
  }
}

export default connectGlobal(state => ({
  globalSettings: state.settings,
}))(AuthScreen);