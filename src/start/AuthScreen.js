/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { AppNavigationMethods } from '../nav/AppNavigator';
import type { GlobalSettingsState } from '../types';
import { createStyleSheet } from '../styles';
import { connectGlobal } from '../react-redux';
import { Screen, ZulipButton } from '../common';
import { getGlobalSettings } from '../selectors';
import PasswordAuthView from './PasswordAuthView';
import OAuthView from './OAuthView';
import NavButton from '../nav/NavButton';
import { openLinkWithUserPreference } from '../utils/openLink';

const componentStyles = createStyleSheet({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    marginTop: 8,
  },
  navWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

type Props = $ReadOnly<{|
  navigation: AppNavigationMethods,
  globalSettings: GlobalSettingsState,
|}>;

class AuthScreen extends PureComponent<Props> {
  handleDevAuth = () => {
    this.props.navigation.push('dev-auth');
  };

  handleOpenDocumentation = () => {
    const { globalSettings } = this.props;
    openLinkWithUserPreference(new URL('https://zulip.com/help/'), globalSettings);
  };

  render(): Node {
    return (
      <Screen title="Sign in" shouldShowLoadingBanner={false} padding={false}>
        <View style={componentStyles.navWrapper}>
          <NavButton
            name="information-circle-outline"
            color="gray"
            onPress={this.handleOpenDocumentation}
            accessibilityLabel="Open documentation"
          />
        </View>
        <View style={componentStyles.wrapper}>
          <OAuthView />
          <PasswordAuthView />
          {__DEV__ && (
            <ZulipButton
              style={componentStyles.button}
              secondary
              text="Sign in with dev account"
              onPress={this.handleDevAuth}
            />
          )}
        </View>
      </Screen>
    );
  }
}

export default connectGlobal(state => ({
  globalSettings: getGlobalSettings(state),
}))(AuthScreen);