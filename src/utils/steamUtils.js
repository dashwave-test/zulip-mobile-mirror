// @flow strict-local
import type { Auth } from '../types';
import changeStreamPrivacy from '../api/subscriptions/changeStreamPrivacy';

/**
 * Tries to change the privacy setting of a stream.
 * On failure, logs the error and shows a feedback message.
 */
export const attemptChangeStreamPrivacy = async (
  auth: Auth,
  streamId: number,
  isPrivate: boolean
): Promise<void> => {
  try {
    await changeStreamPrivacy(auth, streamId, isPrivate);
    console.log('Stream privacy changed successfully.');
    // Optionally, show a success message to the user
  } catch (error) {
    console.error('Failed to change stream privacy:', error);
    // Show feedback message to the user
    alert('Failed to change the stream privacy. Please check your permissions and try again.');
  }
};
