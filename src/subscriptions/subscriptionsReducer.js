/* @flow strict-local */
import { EventTypes } from '../api/eventTypes';
import type { SubscriptionsState, PerAccountApplicableAction } from '../types';
import { ensureUnreachable } from '../types';
import { updateStreamProperties } from '../streams/streamsReducer';
import {
  EVENT_SUBSCRIPTION,
  REGISTER_COMPLETE,
  EVENT,
  RESET_ACCOUNT_DATA,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';
import { filterArray } from '../utils/immutability';

const initialState: SubscriptionsState = NULL_ARRAY;

export default (
  state: SubscriptionsState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): SubscriptionsState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case REGISTER_COMPLETE:
      return action.data.subscriptions;

    case EVENT_SUBSCRIPTION:
      switch (action.op) {
        case 'add':
          return state.concat(
            action.subscriptions.filter(x => !state.find(y => x.stream_id === y.stream_id)),
          );
        case 'remove':
          return filterArray(
            state,
            x => !action.subscriptions.find(y => x && y && x.stream_id === y.stream_id),
          );

        case 'update':
          return state.map(sub =>
            sub.stream_id === action.stream_id ? { ...sub, [action.property]: action.value } : sub,
          );

        case 'peer_add':
        case 'peer_remove':
          // we currently do not track subscribers
          return state;

        default:
          ensureUnreachable(action);
          return state;
      }

    case EVENT: {
      const { event } = action;
      switch (event.type) {
        case EventTypes.stream:
          switch (event.op) {
            case 'update':
              return state.map(sub =>
                // If inlining `updateStreamProperties` with plans to change
                // its logic, note that it has test coverage at its other
                // callsite, but not here, as of 2022-04-19.
                sub.stream_id === event.stream_id ? updateStreamProperties(sub, event) : sub,
              );

            case 'delete':
              return filterArray(
                state,
                sub => !event.streams.find(stream => sub.stream_id === stream.stream_id),
              );

            case 'create':
            case 'occupy':
            case 'vacate':
              return state;

            default:
              ensureUnreachable(event);
              return state;
          }
        default:
          return state;
      }
    }
    default:
      return state;
  }
};
