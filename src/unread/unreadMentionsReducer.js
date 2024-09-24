/* @flow strict-local */
import invariant from 'invariant';

import type { PerAccountApplicableAction } from '../types';
import type { UnreadMentionsState } from './unreadModelTypes';
import {
  REGISTER_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  RESET_ACCOUNT_DATA,
} from '../actionConstants';
import { addItemsToArray, removeItemsFromArray } from '../utils/immutability';
import { NULL_ARRAY } from '../nullObjects';
import * as logging from '../utils/logging';

const initialState: UnreadMentionsState = NULL_ARRAY;

const eventUpdateMessageFlags = (state, action) => {
  if (action.flag !== 'read') {
    return state;
  }

  if (action.all) {
    return initialState;
  }

  if (action.op === 'add') {
    return removeItemsFromArray(state, action.messages);
  } else if (action.op === 'remove') {
    const { message_details } = action;
    if (message_details === undefined) {
      logging.warn('Got update_message_flags/remove/read event without message_details.');
      return state;
    }

    const newUnreadMentions = Array.from(message_details)
      .filter(([id, info]) => info.mentioned && !state.includes(id))
      .map(([id, info]) => id);
    return addItemsToArray(state, newUnreadMentions);
  }

  return state;
};

export default (
  state: UnreadMentionsState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): UnreadMentionsState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case REGISTER_COMPLETE:
      return action.data.unread_msgs.mentions;

    case EVENT_NEW_MESSAGE: {
      const { flags } = action.message;
      invariant(flags, 'message in EVENT_NEW_MESSAGE must have flags');
      if (flags.includes('read')) {
        return state;
      }
      return (flags.includes('mentioned') || flags.includes('wildcard_mentioned'))
        && !state.includes(action.message.id)
        ? addItemsToArray(state, [action.message.id])
        : state;
    }

    case EVENT_MESSAGE_DELETE:
      return removeItemsFromArray(state, action.messageIds);

    case EVENT_UPDATE_MESSAGE_FLAGS:
      return eventUpdateMessageFlags(state, action);

    default:
      return state;
  }
};
