/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import { useSelector } from '../react-redux';
import NavRow from '../common/NavRow';
import { getOwnUser } from '../selectors';

export default function ProfileScreen(): Node {
  const ownUser = useSelector(getOwnUser);

  return (
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
      {/* Add more NavRows as needed */}
    </View>
  );
}
