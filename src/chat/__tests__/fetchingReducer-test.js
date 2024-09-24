/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import fetchingReducer from '../fetchingReducer';
import {
  HOME_NARROW,
  HOME_NARROW_STR,
  streamNarrow,
  keyFromNarrow,
  SEARCH_NARROW,
} from '../../utils/narrow';
import { MESSAGE_FETCH_START, MESSAGE_FETCH_ERROR } from '../../actionConstants';
import { DEFAULT_FETCHING } from '../fetchingSelectors';

describe('fetchingReducer', () => {
  describe('RESET_ACCOUNT_DATA', () => {
    const initialState = eg.baseReduxState.fetching;
    const action1 = { type: MESSAGE_FETCH_START, narrow: HOME_NARROW, numBefore: 10, numAfter: 10 };
    const prevState = fetchingReducer(initialState, action1);
    expect(prevState).not.toEqual(initialState);

    expect(fetchingReducer(prevState, eg.action.reset_account_data)).toEqual(initialState);
  });

  test('REGISTER_COMPLETE', () => {
    const initialState = eg.baseReduxState.fetching;
    const action1 = { type: MESSAGE_FETCH_START, narrow: HOME_NARROW, numBefore: 10, numAfter: 10 };
    const prevState = fetchingReducer(initialState, action1);
    expect(prevState).not.toEqual(initialState);

    expect(fetchingReducer(prevState, eg.action.register_complete)).toEqual(initialState);
  });

  describe('MESSAGE_FETCH_START', () => {
    test('if messages are fetched before or after the corresponding flag is set', () => {
      const prevState = deepFreeze({ [HOME_NARROW_STR]: { older: false, newer: false } });
      expect(
        fetchingReducer(
          prevState,
          deepFreeze({
            type: MESSAGE_FETCH_START,
            narrow: HOME_NARROW,
            numBefore: 10,
            numAfter: 10,
          }),
        ),
      ).toEqual({ [HOME_NARROW_STR]: { older: true, newer: true } });
    });

    test('if key for narrow does not exist, it is created and corresponding flags are set', () => {
      const narrow = streamNarrow(eg.stream.stream_id);

      const prevState = deepFreeze({ [HOME_NARROW_STR]: { older: false, newer: false } });
      expect(
        fetchingReducer(
          prevState,
          deepFreeze({ type: MESSAGE_FETCH_START, narrow, numBefore: 10, numAfter: 0 }),
        ),
      ).toEqual({
        [HOME_NARROW_STR]: { older: false, newer: false },
        [keyFromNarrow(narrow)]: { older: true, newer: false },
      });
    });

    test('if fetching for a search narrow, ignore', () => {
      const prevState = deepFreeze({ [HOME_NARROW_STR]: { older: false, newer: false } });
      expect(
        fetchingReducer(
          deepFreeze(prevState),
          deepFreeze({ ...eg.action.message_fetch_start, narrow: SEARCH_NARROW('some query') }),
        ),
      ).toEqual(prevState);
    });
  });

  describe('MESSAGE_FETCH_ERROR', () => {
    test('reverses the effect of MESSAGE_FETCH_START as much as possible', () => {
      // As of the addition of this test, that means setting
      // DEFAULT_FETCHING as the key.
      expect(
        [
          deepFreeze({ ...eg.action.message_fetch_start, narrow: HOME_NARROW }),
          deepFreeze({ type: MESSAGE_FETCH_ERROR, narrow: HOME_NARROW, error: new Error() }),
        ].reduce(fetchingReducer, eg.baseReduxState.fetching),
      ).toEqual({ [HOME_NARROW_STR]: DEFAULT_FETCHING });
    });
  });

  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('sets corresponding fetching flags to false, if messages are received before or after', () => {
      const prevState = deepFreeze({ [HOME_NARROW_STR]: { older: true, newer: true } });
      expect(
        fetchingReducer(prevState, {
          ...eg.action.message_fetch_complete,
          narrow: HOME_NARROW,
          numBefore: 10,
          numAfter: 0,
        }),
      ).toEqual({ [HOME_NARROW_STR]: { older: false, newer: true } });
    });

    test('if fetched messages are from a search narrow, ignore them', () => {
      const prevState = deepFreeze({ [HOME_NARROW_STR]: { older: true, newer: true } });
      expect(
        fetchingReducer(
          prevState,
          deepFreeze({ ...eg.action.message_fetch_complete, narrow: SEARCH_NARROW('some query') }),
        ),
      ).toEqual(prevState);
    });
  });
});
