/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';

import type { Narrow } from '../types';
import { useSelector } from '../react-redux';
import Popup from '../common/Popup';
import { getSubscriptions } from '../directSelectors';
import StreamItem from '../streams/StreamItem';

type Props = $ReadOnly<{|
  filter: string,
  onAutocomplete: (name: string) => void,
  destinationNarrow?: Narrow,
|}>;

export default function StreamAutocomplete(props: Props): Node {
  const { filter, onAutocomplete } = props;
  const subscriptions = useSelector(getSubscriptions);

  const handleStreamItemAutocomplete = useCallback(
    stream => onAutocomplete(`**${stream.name}**`),
    [onAutocomplete],
  );

  const isPrefixMatch = x => x.name.toLowerCase().startsWith(filter.toLowerCase());

  const matchingSubscriptions = subscriptions
    // Include it if there's a match anywhere in the name…
    .filter(x => x.name.toLowerCase().includes(filter.toLowerCase()))
    // …but show prefix matches at the top of the list.
    .sort((a, b) => +isPrefixMatch(b) - +isPrefixMatch(a));

  if (matchingSubscriptions.length === 0) {
    return null;
  }

  return (
    <Popup>
      <FlatList
        nestedScrollEnabled
        keyboardShouldPersistTaps="always"
        initialNumToRender={matchingSubscriptions.length}
        data={matchingSubscriptions}
        keyExtractor={item => item.stream_id.toString()}
        renderItem={({ item }) => (
          <StreamItem
            streamId={item.stream_id}
            name={item.name}
            isMuted={!item.in_home_view}
            isPrivate={item.invite_only}
            isWebPublic={item.is_web_public}
            iconSize={12}
            color={item.color}
            onPress={handleStreamItemAutocomplete}
          />
        )}
      />
    </Popup>
  );
}
