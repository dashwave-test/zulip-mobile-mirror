/* @flow strict-local */
import type { ApiResponse, Auth } from './transportTypes';
import { apiPost } from './apiFetch';

type TypingOperation = 'start' | 'stop';

/** See https://zulip.com/api/set-typing-status */
export default (auth: Auth, recipients: string, operation: TypingOperation, zulipFeatureLevel: number): Promise<ApiResponse> => {
  const messageType = zulipFeatureLevel >= 174 ? 'direct' : 'private';

  return apiPost(auth, 'typing', {
    to: recipients,
    op: operation,
    type: messageType,
  });
};
