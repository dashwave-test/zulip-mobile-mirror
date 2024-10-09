/* @flow strict-local */
import React from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from '../styles';

type Props = {|
  backgroundColor?: string,
  hidden?: boolean,
|};

export default function ZulipStatusBar(props: Props) {
  const { backgroundColor = 'white', hidden = false } = props;
  const theme = useTheme();

  const statusBarStyle = (theme === 'dark') ? 'light-content' : 'dark-content';
  const resolvedBackgroundColor = backgroundColor !== undefined ? backgroundColor : theme === 'dark' ? 'hsl(222, 99%, 69%)' : 'white';

  return (
    <StatusBar
      backgroundColor={resolvedBackgroundColor}
      barStyle={statusBarStyle}
      hidden={hidden}
    />
  );
}

