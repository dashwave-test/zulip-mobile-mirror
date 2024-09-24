/* @flow strict-local */
import invariant from 'invariant';

import type { PerAccountApplicableAction, PerAccountState } from '../types';
import type { UnreadPmsState } from './unreadModelTypes';
import {
  REGISTER_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  RESET_ACCOUNT_DATA,
} from '../actionConstants';
import { addItemsToPmArray, removeItemsDeeply } from './unreadHelpers';
import { NULL_ARRAY } from '../nullObjects';
import { recipientsOfPrivateMessage } from '../utils/recipient';
import * as logging from '../utils/logging';
import { getOwnUserId } from '../users/userSelectors';

const initialState: UnreadPmsState = NULL_ARRAY;

const eventNewMessage = (state, action) => {
  if (action.message.type !== 'private') {
    return state;
  }

  if (recipientsOfPrivateMessage(action.message).length > 2) {
    return state;
  }

  invariant(action.message.flags, 'message in EVENT_NEW_MESSAGE must have flags');
  if (action.message.flags.includes('read')) {
    return state;
  }

  return addItemsToPmArray(state, [action.message.id], action.message.sender_id);
};

const eventUpdateMessageFlags = (state, action, ownUserId) => {
  if (action.flag !== 'read') {
    return state;
  }

  if (action.all) {
    return initialState;
  }

  if (action.op === 'add') {
    return removeItemsDeeply(state, action.messages);
  } else if (action.op === 'remove') {
    const { message_details } = action;
    if (message_details === undefined) {
      logging.warn('Got update_message_flags/remove/read event without message_details.');
      return state;
    }

    let newState = state;

    for (const id of action.messages) {
      const message = message_details.get(id);

      if (message && message.type === 'private') {
        // This logic corresponds to pmUnreadsKeyFromOtherUsers, except that
        // the latter returns a string (for the sake of group PMs) and our
        // data structure here wants a UserId.
        if (message.user_ids.length === 1) {
          newState = addItemsToPmArray(newState, [id], message.user_ids[0]);
        } else if (message.user_ids.length === 0) {
          newState = addItemsToPmArray(newState, [id], ownUserId);
        }
      }
    }

    // TODO This re-sorting/deduping is pretty overkill; only the
    //   conversations we actually touched need it.  But rather than add
    //   complications to the `addItemsTo…` system to support that, let's
    //   spend that effort instead to finally rip that system out in favor
    //   of Immutable.js.
    return newState.map(({ sender_id, unread_message_ids }) => ({
      sender_id,
      unread_message_ids: [...new Set(unread_message_ids)].sort((a, b) => a - b),
    }));
  }

  return state;
};

export default (
  state: UnreadPmsState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
  globalState: PerAccountState,
): UnreadPmsState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case REGISTER_COMPLETE:
      return action.data.unread_msgs.pms;

    case EVENT_NEW_MESSAGE:
      return eventNewMessage(state, action);

    case EVENT_MESSAGE_DELETE:
      return removeItemsDeeply(state, action.messageIds);

    case EVENT_UPDATE_MESSAGE_FLAGS:
      return eventUpdateMessageFlags(state, action, getOwnUserId(globalState));

    default:
      return state;
  }
};
