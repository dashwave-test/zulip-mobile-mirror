/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { SectionList } from 'react-native';
import { useSelector } from '../react-redux';

import type { UserOrBot } from '../types';
import { createStyleSheet } from '../styles';
import SectionHeader from '../common/SectionHeader';
import SearchEmptyState from '../common/SearchEmptyState';
import UserItem from './UserItem';
import { sortUserList, filterUserList, groupUsersByStatus } from './userHelpers';
import { getMutedUsers } from '../selectors';
import { getPresence } from '../presence/presenceModel';
import { ensureUnreachable } from '../generics';

const styles = createStyleSheet({
  list: {
    flex: 1,
  },
});

type Props = $ReadOnly<{|
  filter: string,
  users: $ReadOnlyArray<UserOrBot>,
  selected?: $ReadOnlyArray<UserOrBot>,
  onPress: (user: UserOrBot) => void,
|}>;

export default function UserList(props: Props): Node {
  const { filter, users, onPress, selected = [] } = props;
  const mutedUsers = useSelector(getMutedUsers);
  const presences = useSelector(getPresence);

  const filteredUsers = filterUserList(users, filter).filter(user => !mutedUsers.has(user.user_id));

  if (filteredUsers.length === 0) {
    return <SearchEmptyState text="No users found" />;
  }

  const sortedUsers = sortUserList(filteredUsers, presences);
  const groupedUsers = groupUsersByStatus(sortedUsers, presences);
  const sections = Object.keys(groupedUsers).map(key => ({
    key,
    data: groupedUsers[key].map(u => u.user_id),
  }));

  return (
    <SectionList
      style={styles.list}
      stickySectionHeadersEnabled
      keyboardShouldPersistTaps="always"
      initialNumToRender={20}
      sections={sections}
      keyExtractor={item => item}
      renderItem={({ item }) => (
        <UserItem
          key={item}
          userId={item}
          onPress={onPress}
          isSelected={!!selected.find(user => user.user_id === item)}
        />
      )}
      renderSectionHeader={({ section }) =>
        section.data.length === 0 ? null : (
          <SectionHeader
            text={(() => {
              // $FlowIgnore[incompatible-cast] something wrong with SectionList
              const key = (section.key: (typeof sections)[number]['key']);
              switch (key) {
                case 'active':
                  return 'Active';
                case 'idle':
                  return 'Idle';
                case 'offline':
                  return 'Offline';
                case 'unavailable':
                  return 'Unavailable';
                default: {
                  ensureUnreachable(key);
                  return key;
                }
              }
            })()}
          />
        )
      }
    />
  );
}
