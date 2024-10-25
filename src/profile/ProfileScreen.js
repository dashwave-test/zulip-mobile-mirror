/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import { useSelector } from '../react-redux';
import NavRow from '../common/NavRow';
import { getOwnUser } from '../selectors';
import Screen from '../common/Screen';

export default function ProfileScreen(): Node {
  const ownUser = useSelector(getOwnUser);

  return (
    <Screen title="Profile">
      <View>
        <NavRow
          title="Full name"
          subtitle={ownUser.full_name}
          onPress={() => {}}
        />
        <NavRow
          title="Email"
          subtitle={ownUser.email}
          onPress={() => {}}
        />
        <NavRow
          title="Change password"
          onPress={() => {}}
        />
      </View>
    </Screen>
  );
}
