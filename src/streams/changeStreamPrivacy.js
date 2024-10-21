/* @flow strict-local */
import { getAuth } from '../account/accountsSelectors';
import { api } from '../api';
import type { Dispatch, GetState } from '../types';
import { Alert } from 'react-native';

/**
 * Change the privacy of a stream.
 * @param streamId - The ID of the stream to update.
 * @param isPrivate - The new privacy state of the stream.
 */
export const changeStreamPrivacy = (streamId: number, isPrivate: boolean) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = getAuth(getState());
  try {
    await api.subscriptions.changeStreamPrivacy(auth, streamId, isPrivate);
  } catch (error) {
    Alert.alert('Failed to update stream', 'Could not change stream privacy.');
  }
};
