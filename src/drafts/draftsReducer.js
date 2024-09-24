/* @flow strict-local */
import type { DraftsState, PerAccountApplicableAction } from '../types';
import { DRAFT_UPDATE, RESET_ACCOUNT_DATA } from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';
import { keyFromNarrow } from '../utils/narrow';

const initialState = NULL_OBJECT;

const draftUpdate = (state, action) => {
  const narrowStr = keyFromNarrow(action.narrow);

  if (action.content.trim().length === 0) {
    // New content is blank; delete the draft.
    if (!state[narrowStr]) {
      return state;
    }
    const newState = { ...state };
    delete newState[narrowStr];
    return newState;
  }

  return state[narrowStr] === action.content ? state : { ...state, [narrowStr]: action.content };
};

export default (
  state: DraftsState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): DraftsState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case DRAFT_UPDATE:
      return draftUpdate(state, action);

    default:
      return state;
  }
};
