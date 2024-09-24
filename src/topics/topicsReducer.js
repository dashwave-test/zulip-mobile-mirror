/* @flow strict-local */
import type { TopicsState, PerAccountApplicableAction } from '../types';
import {
  INIT_TOPICS,
  EVENT_NEW_MESSAGE,
  REGISTER_COMPLETE,
  RESET_ACCOUNT_DATA,
} from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';
import { replaceItemInArray } from '../utils/immutability';

const initialState: TopicsState = NULL_OBJECT;

const eventNewMessage = (state, action) => {
  if (action.message.type !== 'stream') {
    return state;
  }

  if (!state[action.message.stream_id]) {
    return {
      ...state,
      [action.message.stream_id]: [
        {
          max_id: action.message.id,
          name: action.message.subject,
        },
      ],
    };
  }

  return {
    ...state,
    [action.message.stream_id]: replaceItemInArray(
      state[action.message.stream_id],
      x => x.name === action.message.subject,
      () => ({
        max_id: action.message.id,
        name: action.message.subject,
      }),
    ),
  };
};

export default (
  state: TopicsState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): TopicsState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    // Reset to clear stale data; payload has no initial data for this model
    case REGISTER_COMPLETE:
      return initialState;

    case INIT_TOPICS:
      return {
        ...state,
        [action.streamId]: action.topics,
      };

    case EVENT_NEW_MESSAGE:
      return eventNewMessage(state, action);

    default:
      return state;
  }
};
