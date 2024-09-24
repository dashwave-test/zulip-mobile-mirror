/* @flow strict-local */
import type { OutboxState, PerAccountApplicableAction, Outbox } from '../types';
import {
  REGISTER_COMPLETE,
  MESSAGE_SEND_START,
  EVENT_NEW_MESSAGE,
  DELETE_OUTBOX_MESSAGE,
  MESSAGE_SEND_COMPLETE,
  RESET_ACCOUNT_DATA,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';
import { filterArray } from '../utils/immutability';

const initialState = NULL_ARRAY;

const messageSendStart = (state, action) => {
  const message = state.find(item => item.timestamp === action.outbox.timestamp);
  if (message) {
    return state;
  }
  return [...state, { ...action.outbox }];
};

export default (
  state: OutboxState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): OutboxState => {
  switch (action.type) {
    // TODO(#3881): Figure out if we want this.
    case REGISTER_COMPLETE:
      return filterArray(state, (outbox: Outbox) => !outbox.isSent);

    case MESSAGE_SEND_START:
      return messageSendStart(state, action);

    case MESSAGE_SEND_COMPLETE:
      return state.map(<O: Outbox>(item: O): O =>
        item.id !== action.local_message_id ? item : { ...(item: O), isSent: true },
      );

    case DELETE_OUTBOX_MESSAGE:
    case EVENT_NEW_MESSAGE:
      return filterArray(state, item => item && item.timestamp !== +action.local_message_id);

    case RESET_ACCOUNT_DATA:
      return initialState;

    default:
      return state;
  }
};
