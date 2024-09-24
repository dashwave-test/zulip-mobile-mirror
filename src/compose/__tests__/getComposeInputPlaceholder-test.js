/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import getComposeInputPlaceholder from '../getComposeInputPlaceholder';
import {
  pm1to1NarrowFromUser,
  streamNarrow,
  topicNarrow,
  pmNarrowFromUsersUnsafe,
} from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';
import { getStreamsById } from '../../selectors';
import { mock_ } from '../../__tests__/lib/intl';

describe('getComposeInputPlaceholder', () => {
  const usersById = new Map([eg.selfUser, eg.otherUser, eg.thirdUser].map(u => [u.user_id, u]));
  const ownUserId = eg.selfUser.user_id;
  const streamsById = getStreamsById(eg.plusReduxState);

  test('returns "Message This Person" object for person narrow', () => {
    const narrow = deepFreeze(pm1to1NarrowFromUser(eg.otherUser));
    const placeholder = getComposeInputPlaceholder(
      narrow,
      ownUserId,
      usersById,
      streamsById,
      false,
      mock_,
    );
    expect(placeholder).toEqual({
      text: 'Message {recipient}',
      values: { recipient: eg.otherUser.full_name },
    });
  });

  test('returns "Jot down something" object for self narrow', () => {
    const narrow = deepFreeze(pm1to1NarrowFromUser(eg.selfUser));
    const placeholder = getComposeInputPlaceholder(
      narrow,
      ownUserId,
      usersById,
      streamsById,
      false,
      mock_,
    );
    expect(placeholder).toEqual({ text: 'Jot down something' });
  });

  test('returns "Message #streamName" for stream narrow', () => {
    const narrow = deepFreeze(streamNarrow(eg.stream.stream_id));
    const placeholder = getComposeInputPlaceholder(
      narrow,
      ownUserId,
      usersById,
      streamsById,
      false,
      mock_,
    );
    expect(placeholder).toEqual({
      text: 'Message {recipient}',
      values: { recipient: `#${eg.stream.name}` },
    });
  });

  test('returns properly for topic narrow', () => {
    const narrow = deepFreeze(topicNarrow(eg.stream.stream_id, 'Copenhagen'));
    const placeholder = getComposeInputPlaceholder(
      narrow,
      ownUserId,
      usersById,
      streamsById,
      false,
      mock_,
    );
    expect(placeholder).toEqual({ text: 'Reply' });
  });

  test('returns "Message group" object for group narrow', () => {
    const narrow = deepFreeze(pmNarrowFromUsersUnsafe([eg.otherUser, eg.thirdUser]));
    const placeholder = getComposeInputPlaceholder(
      narrow,
      ownUserId,
      usersById,
      streamsById,
      false,
      mock_,
    );
    expect(placeholder).toEqual({ text: 'Message group' });
  });
});
