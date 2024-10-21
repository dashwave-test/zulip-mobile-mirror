/* @flow strict-local */
import React from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import { useDispatch } from '../react-redux';
import { changeStreamPrivacy } from '../streams/changeStreamPrivacy';

type Props = $ReadOnly<{|
  streamId: number,
  streamName: string,
  isPrivate: boolean,
|}>;

export default function StreamSettings(props: Props) {
  const { streamId, streamName, isPrivate } = props;
  const dispatch = useDispatch();

  const handleTogglePrivacy = (value: boolean) => {
    if (value) {
      Alert.alert('Confirm', 'Are you sure you want to make this stream private?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Make Private',
          onPress: () => {
            dispatch(changeStreamPrivacy(streamId, true));
          },
        },
      ]);
    } else {
      dispatch(changeStreamPrivacy(streamId, false));
    }
  };

  return (
    <View>
      <Text>{streamName}</Text>
      <Switch value={isPrivate} onValueChange={handleTogglePrivacy} />
    </View>
  );
}
