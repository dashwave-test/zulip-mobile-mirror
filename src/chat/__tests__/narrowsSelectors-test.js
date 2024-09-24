/* @flow strict-local */
import Immutable from 'immutable';

import {
  getFirstMessageId,
  getLastMessageId,
  getMessagesForNarrow,
  getStreamInNarrow,
  isNarrowValid,
  getShownMessagesForNarrow,
} from '../narrowsSelectors';
import {
  HOME_NARROW,
  HOME_NARROW_STR,
  pm1to1NarrowFromUser,
  streamNarrow,
  topicNarrow,
  MENTIONED_NARROW,
  STARRED_NARROW,
  pmNarrowFromUsersUnsafe,
  keyFromNarrow,
} from '../../utils/narrow';
import { NULL_SUBSCRIPTION } from '../../nullObjects';
import * as eg from '../../__tests__/lib/exampleData';
import { makeMuteState } from '../../mute/__tests__/mute-testlib';
import { UserTopicVisibilityPolicy } from '../../api/modelTypes';

describe('getMessagesForNarrow', () => {
  const message = eg.streamMessage({ id: 123 });
  const messages = eg.makeMessagesState([message]);
  const outboxMessage = eg.streamOutbox({});

  test('if no outbox messages returns messages with no change', () => {
    const state = eg.reduxState({
      narrows: Immutable.Map([[HOME_NARROW_STR, [123]]]),
      messages,
      outbox: [],
      users: [eg.selfUser],
      realm: eg.realmState({ user_id: eg.selfUser.user_id, email: eg.selfUser.email }),
    });

    const result = getMessagesForNarrow(state, HOME_NARROW);

    expect(result).toEqual([state.messages.get(123)]);
  });

  test('combine messages and outbox in same narrow', () => {
    const state = eg.reduxState({
      narrows: Immutable.Map([[HOME_NARROW_STR, [123]]]),
      messages,
      outbox: [outboxMessage],
      caughtUp: {
        [HOME_NARROW_STR]: { older: false, newer: true },
      },
      users: [eg.selfUser],
      realm: eg.realmState({ user_id: eg.selfUser.user_id, email: eg.selfUser.email }),
    });

    const result = getMessagesForNarrow(state, HOME_NARROW);

    expect(result).toEqual([message, outboxMessage]);
  });

  test('do not combine messages and outbox if not caught up', () => {
    const state = eg.reduxState({
      narrows: Immutable.Map([[HOME_NARROW_STR, [123]]]),
      messages,
      outbox: [outboxMessage],
      users: [eg.selfUser],
      realm: eg.realmState({ user_id: eg.selfUser.user_id, email: eg.selfUser.email }),
    });

    const result = getMessagesForNarrow(state, HOME_NARROW);

    expect(result).toEqual([state.messages.get(123)]);
  });

  test('do not combine messages and outbox in different narrow', () => {
    const state = eg.reduxState({
      narrows: Immutable.Map([[keyFromNarrow(pm1to1NarrowFromUser(eg.otherUser)), [123]]]),
      messages,
      outbox: [outboxMessage],
      users: [eg.selfUser],
      realm: eg.realmState({ user_id: eg.selfUser.user_id, email: eg.selfUser.email }),
    });

    const result = getMessagesForNarrow(state, pm1to1NarrowFromUser(eg.otherUser));

    expect(result).toEqual([message]);
  });
});

/* eslint-disable no-shadow */
describe('getShownMessagesForNarrow', () => {
  const stream = eg.stream;
  const message = eg.streamMessage();
  const subscription = eg.subscription;
  const mutedSubscription = { ...subscription, in_home_view: false };
  const muteTopic = makeMuteState([[stream, message.subject]]);
  const unmuteTopic = makeMuteState([[stream, message.subject, UserTopicVisibilityPolicy.Unmuted]]);

  const makeStateGeneral = (message, narrow, extra) =>
    eg.reduxStatePlus({
      messages: eg.makeMessagesState([message]),
      narrows: Immutable.Map([[keyFromNarrow(narrow), [message.id]]]),
      ...extra,
    });
  const shownGeneral = (state, narrow) => getShownMessagesForNarrow(state, narrow).length > 0;

  describe('HOME_NARROW', () => {
    const narrow = HOME_NARROW;
    const makeState = extra => makeStateGeneral(message, narrow, extra);
    const shown = state => shownGeneral(state, narrow);

    test('private message shown', () => {
      expect(shown(makeStateGeneral(eg.pmMessage(), narrow))).toEqual(true);
    });

    test('stream message shown in base case', () => {
      expect(shown(makeState())).toEqual(true);
    });

    test('stream message hidden if not subscribed to stream', () => {
      expect(shown(makeState({ subscriptions: [] }))).toEqual(false);
    });

    test('stream message hidden if stream muted', () => {
      expect(shown(makeState({ subscriptions: [mutedSubscription] }))).toEqual(false);
    });

    test('stream message shown if topic unmuted, even though stream muted', () => {
      expect(shown(makeState({ subscriptions: [mutedSubscription], mute: unmuteTopic }))).toEqual(
        true,
      );
    });

    test('stream message hidden if topic muted', () => {
      expect(shown(makeState({ mute: muteTopic }))).toEqual(false);
    });

    test('@-mention message is always shown', () => {
      const flags = { ...eg.plusReduxState.flags, mentioned: { [message.id]: true } };
      expect(shown(makeState({ flags, subscriptions: [] }))).toEqual(true);
      expect(shown(makeState({ flags, subscriptions: [mutedSubscription] }))).toEqual(true);
      expect(shown(makeState({ flags, mute: muteTopic }))).toEqual(true);
    });
  });

  describe('stream narrow', () => {
    const narrow = streamNarrow(stream.stream_id);
    const makeState = extra => makeStateGeneral(message, narrow, extra);
    const shown = state => shownGeneral(state, narrow);

    test('message shown even if not subscribed to stream', () => {
      expect(shown(makeState({ subscriptions: [] }))).toEqual(true);
    });

    test('message shown even if stream muted', () => {
      expect(shown(makeState({ subscriptions: [mutedSubscription] }))).toEqual(true);
    });

    test('message hidden if topic muted', () => {
      expect(shown(makeState({ mute: muteTopic }))).toEqual(false);
    });

    test('@-mention message is always shown', () => {
      const flags = { ...eg.plusReduxState.flags, mentioned: { [message.id]: true } };
      expect(shown(makeState({ flags, subscriptions: [] }))).toEqual(true);
      expect(shown(makeState({ flags, subscriptions: [mutedSubscription] }))).toEqual(true);
      expect(shown(makeState({ flags, mute: muteTopic }))).toEqual(true);
    });
  });

  describe('topic narrow', () => {
    const narrow = topicNarrow(stream.stream_id, message.subject);
    const makeState = extra => makeStateGeneral(message, narrow, extra);
    const shown = state => shownGeneral(state, narrow);

    test('message shown even if not subscribed to stream', () => {
      expect(shown(makeState({ subscriptions: [] }))).toEqual(true);
    });

    test('message shown even if stream muted', () => {
      expect(shown(makeState({ subscriptions: [mutedSubscription] }))).toEqual(true);
    });

    test('message shown even if topic muted', () => {
      expect(shown(makeState({ mute: muteTopic }))).toEqual(true);
    });
  });

  describe('starred-messages narrow', () => {
    const narrow = STARRED_NARROW;
    const makeState = extra => makeStateGeneral(message, narrow, extra);
    const shown = state => shownGeneral(state, narrow);

    test('message shown even if not subscribed to stream', () => {
      expect(shown(makeState({ subscriptions: [] }))).toEqual(true);
    });

    test('message shown even if stream muted', () => {
      expect(shown(makeState({ subscriptions: [mutedSubscription] }))).toEqual(true);
    });

    test('message shown even if topic muted', () => {
      expect(shown(makeState({ mute: muteTopic }))).toEqual(true);
    });
  });

  describe('@-mentions narrow', () => {
    const narrow = MENTIONED_NARROW;
    const makeState = extra => makeStateGeneral(message, narrow, extra);
    const shown = state => shownGeneral(state, narrow);

    test('message shown even if not subscribed to stream', () => {
      expect(shown(makeState({ subscriptions: [] }))).toEqual(true);
    });

    test('message shown even if stream muted', () => {
      expect(shown(makeState({ subscriptions: [mutedSubscription] }))).toEqual(true);
    });

    test('message shown even if topic muted', () => {
      expect(shown(makeState({ mute: muteTopic }))).toEqual(true);
    });
  });
});

describe('getFirstMessageId', () => {
  test('return undefined when there are no messages', () => {
    const state = eg.reduxState({
      narrows: Immutable.Map([[HOME_NARROW_STR, []]]),
      outbox: [],
    });

    const result = getFirstMessageId(state, HOME_NARROW);

    expect(result).toEqual(undefined);
  });

  test('returns first message id', () => {
    const state = eg.reduxState({
      narrows: Immutable.Map([[HOME_NARROW_STR, [1, 2, 3]]]),
      messages: eg.makeMessagesState([
        eg.streamMessage({ id: 1 }),
        eg.streamMessage({ id: 2 }),
        eg.streamMessage({ id: 3 }),
      ]),
      outbox: [],
    });

    const result = getFirstMessageId(state, HOME_NARROW);

    expect(result).toEqual(1);
  });
});

describe('getLastMessageId', () => {
  test('return undefined when there are no messages', () => {
    const state = eg.reduxState({
      narrows: Immutable.Map([[HOME_NARROW_STR, []]]),
      messages: eg.makeMessagesState([]),
      outbox: [],
    });

    const result = getLastMessageId(state, HOME_NARROW);

    expect(result).toEqual(undefined);
  });

  test('returns last message id', () => {
    const state = eg.reduxState({
      narrows: Immutable.Map([[HOME_NARROW_STR, [1, 2, 3]]]),
      messages: eg.makeMessagesState([
        eg.streamMessage({ id: 1 }),
        eg.streamMessage({ id: 2 }),
        eg.streamMessage({ id: 3 }),
      ]),
      outbox: [],
    });

    const result = getLastMessageId(state, HOME_NARROW);

    expect(result).toEqual(3);
  });
});

describe('getStreamInNarrow', () => {
  const stream1 = eg.makeStream({ name: 'stream' });
  const stream2 = eg.makeStream({ name: 'stream2' });
  const stream3 = eg.makeStream({ name: 'stream3' });
  const stream4 = eg.makeStream({ name: 'stream4' });
  const sub1 = eg.makeSubscription({ stream: stream1, in_home_view: false });
  const sub2 = eg.makeSubscription({ stream: stream2, in_home_view: true });

  const state = eg.reduxState({
    streams: [stream1, stream2, stream3],
    subscriptions: [sub1, sub2],
  });

  test('return subscription if stream in narrow is subscribed', () => {
    const narrow = streamNarrow(stream1.stream_id);

    expect(getStreamInNarrow(state, narrow)).toEqual(sub1);
  });

  test('return stream if stream in narrow is not subscribed', () => {
    const narrow = streamNarrow(stream3.stream_id);

    expect(getStreamInNarrow(state, narrow)).toEqual({ ...stream3, in_home_view: true });
  });

  test('return NULL_SUBSCRIPTION if stream in narrow is not valid', () => {
    const narrow = streamNarrow(stream4.stream_id);

    expect(getStreamInNarrow(state, narrow)).toEqual(NULL_SUBSCRIPTION);
  });

  test('return NULL_SUBSCRIPTION is narrow is not topic or stream', () => {
    expect(getStreamInNarrow(state, pm1to1NarrowFromUser(eg.otherUser))).toEqual(NULL_SUBSCRIPTION);
    expect(getStreamInNarrow(state, topicNarrow(stream4.stream_id, 'topic'))).toEqual(
      NULL_SUBSCRIPTION,
    );
  });
});

describe('isNarrowValid', () => {
  test('narrowing to a special narrow is always valid', () => {
    const narrow = STARRED_NARROW;
    expect(isNarrowValid(eg.plusReduxState, narrow)).toBe(true);
  });

  test('narrowing to an existing stream is valid', () => {
    const narrow = streamNarrow(eg.stream.stream_id);
    expect(isNarrowValid(eg.plusReduxState, narrow)).toBe(true);
  });

  test('narrowing to a non-existing stream is invalid', () => {
    const narrow = streamNarrow(eg.makeStream().stream_id);
    expect(isNarrowValid(eg.plusReduxState, narrow)).toBe(false);
  });

  test('narrowing to an existing stream is valid regardless of topic', () => {
    const narrow = topicNarrow(eg.stream.stream_id, 'topic does not matter');
    expect(isNarrowValid(eg.plusReduxState, narrow)).toBe(true);
  });

  test('narrowing to a PM with existing user is valid', () => {
    const narrow = pm1to1NarrowFromUser(eg.otherUser);
    expect(isNarrowValid(eg.plusReduxState, narrow)).toBe(true);
  });

  test('narrowing to a PM with non-existing user is not valid', () => {
    const narrow = pm1to1NarrowFromUser(eg.makeUser());
    expect(isNarrowValid(eg.plusReduxState, narrow)).toBe(false);
  });

  test('narrowing to a group chat with existing users is valid', () => {
    const narrow = pmNarrowFromUsersUnsafe([eg.otherUser, eg.thirdUser]);
    expect(isNarrowValid(eg.plusReduxState, narrow)).toBe(true);
  });

  test('narrowing to a group chat with non-existing users is not valid', () => {
    const narrow = pmNarrowFromUsersUnsafe([eg.otherUser, eg.makeUser()]);
    expect(isNarrowValid(eg.plusReduxState, narrow)).toBe(false);
  });

  test('narrowing to a PM with bots is valid', () => {
    const narrow = pm1to1NarrowFromUser(eg.crossRealmBot);
    expect(isNarrowValid(eg.plusReduxState, narrow)).toBe(true);
  });

  test('narrowing to non active users is valid', () => {
    const notActiveUser = eg.makeUser();
    const state = eg.reduxState({ realm: { ...eg.realmState(), nonActiveUsers: [notActiveUser] } });
    const narrow = pm1to1NarrowFromUser(notActiveUser);
    expect(isNarrowValid(state, narrow)).toBe(true);
  });
});
