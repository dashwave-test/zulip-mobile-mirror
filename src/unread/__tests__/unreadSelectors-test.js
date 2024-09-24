/* @flow strict-local */

import {
  getUnreadByStream,
  getUnreadStreamTotal,
  getUnreadByPms,
  getUnreadPmsTotal,
  getUnreadByHuddles,
  getUnreadHuddlesTotal,
  getUnreadMentionsTotal,
  getUnreadTotal,
  getUnreadStreamsAndTopics,
} from '../unreadSelectors';

import * as eg from '../../__tests__/lib/exampleData';
import {
  initialState,
  makeUnreadState,
  selectorBaseState as unreadState,
  stream0,
  stream2,
} from './unread-testlib';
import { makeMuteState } from '../../mute/__tests__/mute-testlib';
import { UserTopicVisibilityPolicy } from '../../api/modelTypes';

const subscription0 = eg.makeSubscription({ stream: stream0, color: 'red' });
const subscription2 = eg.makeSubscription({ stream: stream2, color: 'blue' });
const subscriptions = [subscription0, subscription2];

describe('getUnreadByStream', () => {
  test('when no items in streams key, the result is an empty object', () => {
    const state = eg.reduxState();

    const unreadByStream = getUnreadByStream(state);

    expect(unreadByStream).toEqual({});
  });

  test('when there are unread stream messages, returns their counts', () => {
    const state = eg.reduxStatePlus({
      subscriptions,
      unread: unreadState,
      mute: makeMuteState([[stream0, 'a topic']]),
    });

    const unreadByStream = getUnreadByStream(state);

    expect(unreadByStream).toEqual({ '0': 2, '2': 2 });
  });
});

describe('getUnreadStreamTotal', () => {
  test('when no items in "streams" key, there are unread message', () => {
    const state = eg.reduxStatePlus({
      unread: initialState,
      subscriptions: [],
    });

    const unreadCount = getUnreadStreamTotal(state);

    expect(unreadCount).toEqual(0);
  });

  test('count all the unread messages listed in "streams" key', () => {
    const state = eg.reduxStatePlus({
      unread: unreadState,
    });

    const unreadCount = getUnreadStreamTotal(state);

    expect(unreadCount).toEqual(7);
  });
});

describe('getUnreadByPms', () => {
  test('when no items in streams key, the result is an empty array', () => {
    const state = eg.reduxStatePlus({
      unread: initialState,
    });

    const unreadByStream = getUnreadByPms(state);

    expect(unreadByStream).toEqual({});
  });

  test('when there are unread private messages, returns counts by sender_id', () => {
    const state = eg.reduxStatePlus({
      unread: unreadState,
    });

    const unreadByStream = getUnreadByPms(state);

    expect(unreadByStream).toEqual({ '0': 2, '2': 3 });
  });
});

describe('getUnreadPmsTotal', () => {
  test('when no items in "pms" key, there are unread private messages', () => {
    const state = eg.reduxStatePlus({
      unread: initialState,
    });

    const unreadCount = getUnreadPmsTotal(state);

    expect(unreadCount).toEqual(0);
  });

  test('when there are keys in "pms", sum up all unread private message counts', () => {
    const state = eg.reduxStatePlus({
      unread: unreadState,
    });

    const unreadCount = getUnreadPmsTotal(state);

    expect(unreadCount).toEqual(5);
  });
});

describe('getUnreadByHuddles', () => {
  test('when no items in streams key, the result is an empty array', () => {
    const state = eg.reduxStatePlus({
      unread: initialState,
    });

    const unreadByStream = getUnreadByHuddles(state);

    expect(unreadByStream).toEqual({});
  });

  test('when there are unread stream messages, returns a ', () => {
    const state = eg.reduxStatePlus({
      unread: unreadState,
    });

    const unreadByStream = getUnreadByHuddles(state);

    expect(unreadByStream).toEqual({ '1,2,3': 2, '1,4,5': 3 });
  });
});

describe('getUnreadHuddlesTotal', () => {
  test('when no items in "huddles" key, there are unread group messages', () => {
    const state = eg.reduxStatePlus({
      unread: initialState,
    });

    const unreadCount = getUnreadHuddlesTotal(state);

    expect(unreadCount).toEqual(0);
  });

  test('when there are keys in "huddles", sum up all unread group message counts', () => {
    const state = eg.reduxStatePlus({
      unread: unreadState,
    });

    const unreadCount = getUnreadHuddlesTotal(state);

    expect(unreadCount).toEqual(5);
  });
});

describe('getUnreadMentionsTotal', () => {
  test('unread mentions count is equal to the unread array length', () => {
    const state = eg.reduxStatePlus({
      unread: unreadState,
    });

    const unreadCount = getUnreadMentionsTotal(state);

    expect(unreadCount).toEqual(3);
  });
});

describe('getUnreadTotal', () => {
  test('if no key has any items then no unread messages', () => {
    const state = eg.reduxStatePlus({
      unread: initialState,
      subscriptions: [],
    });

    const unreadCount = getUnreadTotal(state);

    expect(unreadCount).toEqual(0);
  });

  test('calculates total unread of streams + pms + huddles', () => {
    const state = eg.reduxStatePlus({
      unread: unreadState,
    });

    const unreadCount = getUnreadTotal(state);

    expect(unreadCount).toEqual(20);
  });
});

describe('getUnreadStreamsAndTopics', () => {
  test('if no key has any items then no unread messages', () => {
    const state = eg.reduxStatePlus({
      subscriptions: [],
      unread: initialState,
    });

    const unreadCount = getUnreadStreamsAndTopics(state);

    expect(unreadCount).toEqual([]);
  });

  test('group data by stream and topics inside, count unread', () => {
    const state = eg.reduxStatePlus({
      subscriptions,
      unread: unreadState,
    });

    const unreadCount = getUnreadStreamsAndTopics(state);

    expect(unreadCount).toEqual([
      {
        key: 'stream:0',
        streamId: 0,
        streamName: 'stream 0',
        color: 'red',
        unread: 5,
        isPinned: false,
        isPrivate: false,
        isWebPublic: false,
        data: [
          {
            key: 'another topic',
            topic: 'another topic',
            unread: 2,
            lastUnreadMsgId: 5,
            isMentioned: false,
          },
          {
            key: 'a topic',
            topic: 'a topic',
            unread: 3,
            lastUnreadMsgId: 3,
            isMentioned: true,
          },
        ],
      },
      {
        key: 'stream:2',
        streamId: 2,
        streamName: 'stream 2',
        color: 'blue',
        unread: 2,
        isPinned: false,
        isPrivate: false,
        isWebPublic: false,
        data: [
          {
            key: 'some other topic',
            topic: 'some other topic',
            unread: 2,
            lastUnreadMsgId: 7,
            isMentioned: false,
          },
        ],
      },
    ]);
  });

  test('streams are sorted alphabetically, case-insensitive, topics by last activity, pinned stream on top', () => {
    const stream1 = eg.makeStream({ name: 'xyz stream', stream_id: 1 });
    const state = eg.reduxStatePlus({
      subscriptions: [
        { ...subscription2, color: 'green', name: 'def stream' },
        eg.makeSubscription({ stream: stream1, color: 'blue', pin_to_top: true }),
        { ...subscription0, name: 'abc stream' },
      ],
      unread: makeUnreadState(eg.plusReduxState, [
        eg.streamMessage({ stream_id: 0, subject: 'z topic', id: 1 }),
        eg.streamMessage({ stream_id: 0, subject: 'z topic', id: 2 }),
        eg.streamMessage({ stream_id: 0, subject: 'z topic', id: 3 }),
        eg.streamMessage({ stream_id: 0, subject: 'a topic', id: 4 }),
        eg.streamMessage({ stream_id: 0, subject: 'a topic', id: 5 }),
        eg.streamMessage({ stream_id: 2, subject: 'b topic', id: 6 }),
        eg.streamMessage({ stream_id: 2, subject: 'b topic', id: 7 }),
        eg.streamMessage({ stream_id: 2, subject: 'c topic', id: 7 }),
        eg.streamMessage({ stream_id: 2, subject: 'c topic', id: 8 }),
        eg.streamMessage({ stream_id: 1, subject: 'e topic', id: 10 }),
        eg.streamMessage({ stream_id: 1, subject: 'd topic', id: 9 }),
      ]),
      // TODO yuck at constructing this modified stream as a throwaway, with magic string
      mute: makeMuteState([[{ ...stream2, name: 'def stream' }, 'c topic']]),
    });

    const unreadCount = getUnreadStreamsAndTopics(state);

    expect(unreadCount).toEqual([
      {
        key: 'stream:1',
        streamId: 1,
        streamName: 'xyz stream',
        color: 'blue',
        isPrivate: false,
        isPinned: true,
        isWebPublic: false,
        unread: 2,
        data: [
          {
            key: 'e topic',
            topic: 'e topic',
            unread: 1,
            lastUnreadMsgId: 10,
            isMentioned: false,
          },
          {
            key: 'd topic',
            topic: 'd topic',
            unread: 1,
            lastUnreadMsgId: 9,
            isMentioned: false,
          },
        ],
      },
      {
        key: 'stream:0',
        streamId: 0,
        streamName: 'abc stream',
        color: 'red',
        isPrivate: false,
        isPinned: false,
        isWebPublic: false,
        unread: 5,
        data: [
          {
            key: 'a topic',
            topic: 'a topic',
            unread: 2,
            lastUnreadMsgId: 5,
            isMentioned: false,
          },
          {
            key: 'z topic',
            topic: 'z topic',
            unread: 3,
            lastUnreadMsgId: 3,
            isMentioned: false,
          },
        ],
      },
      {
        key: 'stream:2',
        streamId: 2,
        streamName: 'def stream',
        color: 'green',
        isPrivate: false,
        isPinned: false,
        isWebPublic: false,
        unread: 2,
        data: [
          {
            key: 'b topic',
            topic: 'b topic',
            unread: 2,
            lastUnreadMsgId: 7,
            isMentioned: false,
          },
        ],
      },
    ]);
  });

  test('streams with no subscription are not included', () => {
    const state = eg.reduxStatePlus({
      subscriptions: [],
      unread: unreadState,
    });
    expect(getUnreadStreamsAndTopics(state)).toEqual([]);
  });

  test('muted streams are not included', () => {
    const state = eg.reduxStatePlus({
      subscriptions: subscriptions.map(s => ({ ...s, in_home_view: false })),
      unread: unreadState,
    });

    const unreadCount = getUnreadStreamsAndTopics(state);

    expect(unreadCount).toEqual([]);
  });

  test('unmuted topics in muted streams are included', () => {
    const state = eg.reduxStatePlus({
      subscriptions: [{ ...subscription0, in_home_view: false }],
      unread: unreadState,
      mute: makeMuteState([[stream0, 'a topic', UserTopicVisibilityPolicy.Unmuted]]),
    });

    const unreadCount = getUnreadStreamsAndTopics(state);

    expect(unreadCount).toEqual([
      {
        color: 'red',
        data: [
          {
            key: 'a topic',
            topic: 'a topic',
            unread: 3,
            lastUnreadMsgId: 3,
            isMentioned: true,
          },
        ],
        isPinned: false,
        isPrivate: false,
        isWebPublic: false,
        key: 'stream:0',
        streamId: 0,
        streamName: 'stream 0',
        unread: 3,
      },
    ]);
  });

  test('muted topics inside non muted streams are not included', () => {
    const state = eg.reduxStatePlus({
      subscriptions: [subscription0],
      unread: unreadState,
      mute: makeMuteState([[stream0, 'a topic']]),
    });

    const unreadCount = getUnreadStreamsAndTopics(state);

    expect(unreadCount).toEqual([
      {
        color: 'red',
        data: [
          {
            key: 'another topic',
            topic: 'another topic',
            unread: 2,
            lastUnreadMsgId: 5,
            isMentioned: false,
          },
        ],
        isPinned: false,
        isPrivate: false,
        isWebPublic: false,
        key: 'stream:0',
        streamId: 0,
        streamName: 'stream 0',
        unread: 2,
      },
    ]);
  });
});
